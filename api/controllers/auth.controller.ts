import { Request, Response } from "express";
import { customAlphabet } from "nanoid/async";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import errorHandler, { DBError } from "../helpers/error.handler";
import Phone from "../models/phone.model";
import { CustomRequest } from "../middleware";
import config from "../config";
import User from "../models/user.model";
import Nanny from "../models/nanny.model";
import Category from "../models/category.model";
import Bank from "../models/bank.model";
import Card from "../models/card.model";
import Order from "../models/order.model";
import Review from "../models/review.model";

export const submitPhoneNumber = async (req: Request, res: Response) => {
  try {
    const { code, number } = req.body;
    // check credentials
    if (!code || !number) {
      return res
        .status(400)
        .json({ success: false, error: `Phone ${!code ? "country code" : "number"} must be provided` });
    }
    // generate otp
    const nanoid = customAlphabet("1234567890", 4);
    const otp = await nanoid();
    // update or create phone auth session
    const phone = await Phone.findOneAndUpdate(
      { code, number },
      { otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // response
    return res.status(200).json({ success: true, message: `OTP sent to +${code + "" + number}`, data: phone });
  } catch (error) {
    errorHandler(error as DBError, res, "Phone");
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp, code, number } = req.body;
    const role = req.body.role?.toLowerCase();
    // check credentials
    if (!code || !number) {
      return res
        .status(400)
        .json({ success: false, error: `Phone ${!code ? "country code" : "number"} must be provided` });
    }
    const phone = await Phone.findOne({ code, number, otp });
    // return error if phone session does not exist
    if (!phone) return res.status(404).json({ success: false, error: `OTP is invalid for +${code + "" + number}` });
    // check if user already exist
    let user = await User.findOne({ phone: { code, number } });
    let newUser = false;
    //  register user if it does not exist
    if (!user) {
      if (role === "nanny") {
        const categories = await Category.find({}).select("_id name");
        user = await Nanny.create({ phone: { code, number }, categories });
      } else {
        user = await User.create({ phone: { code, number } });
      }
      newUser = true;
    }
    // generate jwtoken
    const access_token = jwt.sign({ _id: user._id }, config.JWT_SECRET as Secret, {});
    // remove phone session
    await Phone.findOneAndDelete({ _id: phone._id });
    // response
    return res
      .status(200)
      .json({ success: true, message: "User authenticated successfully", data: user, access_token, newUser });
  } catch (error) {
    errorHandler(error as DBError, res, "User");
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { phone, ...others } = req.body;
    let user = await User.findOne({ _id });
    if (user?.type === "Nanny") {
      user = await Nanny.findOneAndUpdate({ _id }, { ...others }, { new: true });
    } else {
      user = await User.findOneAndUpdate({ _id }, { ...others }, { new: true });
    }
    // response
    return res.status(200).json({ success: true, message: "Profile updated successfully", data: user });
  } catch (error) {
    errorHandler(error as DBError, res, "User");
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const user = await User.findOne({ _id });
    // response
    return res.status(200).json({ success: true, message: "Profile fetched successfully", data: user });
  } catch (error) {
    errorHandler(error as DBError, res, "User");
  }
};

export const addPaymentBank = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const bank = await Bank.create({ nanny: _id, ...req.body });
    // response
    return res.status(200).json({ success: true, message: "Payment bank added successfully", data: bank });
  } catch (error) {
    errorHandler(error as DBError, res, "Bank");
  }
};

export const getPaymentBanks = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const banks = await Bank.find({ nanny: _id });
    // response
    return res.status(200).json({ success: true, message: "Payment banks fetched successfully", data: banks });
  } catch (error) {
    errorHandler(error as DBError, res, "Bank");
  }
};

export const setActivePaymentBank = async (req: Request, res: Response) => {
  try {
    const nanny = ((req as CustomRequest).user as JwtPayload)._id;
    await Bank.updateMany({ nanny }, { active: false });
    const bank = await Bank.findOneAndUpdate({ _id: req.params.id }, { active: true }, { new: true });
    // response
    return res.status(200).json({ success: true, message: "Bank set as active payment method", data: bank });
  } catch (error) {
    errorHandler(error as DBError, res, "Bank");
  }
};

export const addPaymentCard = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    let cvv = Number(req.body.cvv).toString(Number(config.BASE));
    cvv = jwt.sign({ client: _id }, config.JWT_SECRET as Secret, {});
    const card = await Card.create({ client: _id, ...req.body, cvv });
    // response
    return res.status(200).json({ success: true, message: "Payment card added successfully", data: card });
  } catch (error) {
    errorHandler(error as DBError, res, "Card");
  }
};

export const getPaymentCards = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const cards = await Card.find({ client: _id });
    // response
    return res.status(200).json({ success: true, message: "Payment cards fetched successfully", data: cards });
  } catch (error) {
    errorHandler(error as DBError, res, "Card");
  }
};

export const setActivePaymentCard = async (req: Request, res: Response) => {
  try {
    const client = ((req as CustomRequest).user as JwtPayload)._id;
    await Card.updateMany({ client }, { active: false });
    const card = await Card.findOneAndUpdate({ _id: req.params.id }, { active: true }, { new: true });
    // response
    return res.status(200).json({ success: true, message: "Card set as active payment method", data: card });
  } catch (error) {
    errorHandler(error as DBError, res, "Card");
  }
};

export const getNannyDashboardStats = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const user = await User.findOne({ _id });
    if (user?.type === "Client") {
      return res.status(403).json({ success: false, error: "User must be a Nanny" });
    }
    const total_orders = await Order.estimatedDocumentCount({ "nanny.id": _id });
    const completed = await Order.find({ "nanny.id": _id, status: "completed" });
    const total_earnings = Array.from(completed).reduce((sum, order) => sum + order.price.subtotal, 0);
    const total_reviews = await Review.estimatedDocumentCount({ nanny: _id });
    const total_new_orders = await Order.estimatedDocumentCount({ "nanny.id": _id, status: "pending" });
    const total_upcoming_orders = await Order.estimatedDocumentCount({ "nanny.id": _id, status: "accepted" });
    // response
    return res.status(200).json({
      success: true,
      message: "Nanny dashboard fetched successfully",
      data: { total_orders, total_earnings, total_reviews, total_new_orders, total_upcoming_orders },
    });
  } catch (error) {
    errorHandler(error as DBError, res, "Nanny");
  }
};
