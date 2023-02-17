import { Request, Response } from "express";
import { customAlphabet } from "nanoid/async";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import errorHandler, { DBError } from "../helpers/error.handler";
import Phone from "../models/phone.model";
import { CustomRequest } from "../middleware/auth";
import config from "../config";
import User from "../models/user.model";
import Nanny from "../models/nanny.model";
import Category from "../models/category.model";

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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    // response
    return res.status(200).json({ success: true, message: "Users fetched successfully", data: users });
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
