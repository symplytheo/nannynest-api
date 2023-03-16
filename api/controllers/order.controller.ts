import { Request, Response } from "express";
import Order from "../models/order.model";
import errorHandler, { DBError } from "../helpers/error.handler";
import { CustomRequest } from "../middleware";
import { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/user.model";
import { nanoid } from "nanoid";
import { getDistance } from "geolib";
import Nanny, { INanny } from "../models/nanny.model";
import { CATEGORIES, NANNYDEST, STATUS } from "../helpers/data";
import Review from "../models/review.model";

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const user = await User.findOne({ _id });
    const { fields, status } = req.query;
    const query = fields ? (fields as string).split(",").join(" ") : fields;
    const _status = status ? (status as string).split(",") : STATUS;
    let orders;
    if (user?.type === "Nanny") {
      orders = await Order.find({ "nanny.id": _id, status: { $in: _status } }, query).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ "client.id": _id }, query).sort({ createdAt: -1 });
    }
    // response
    return res.status(200).json({ success: true, message: "Orders fetched successfully", query, data: orders });
  } catch (error) {
    errorHandler(error as DBError, res, "Orders");
  }
};

export const getSingleOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let order = await Order.findOne({ _id: id });
    if (!order) {
      order = await Order.findOne({ referenceId: id });
    }
    // response
    return res.status(200).json({ success: true, message: "Order fetched successfully", data: order });
  } catch (error) {
    errorHandler(error as DBError, res, "Order");
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const client = await User.findOne({ _id });
    if (!client) return res.status(401).json({ success: false, error: "Order can only be booked by a Client" });
    const nanny = await User.findOne({ _id: req.body.nanny });
    const referenceId = nanoid(8);
    let distance = await getDistance(
      { latitude: req.body.address?.lat, longitude: req.body.address?.long },
      {
        latitude: (nanny as IUser).location.lat,
        longitude: (nanny as IUser).location.lat,
      }
    );
    distance = Math.floor(distance / 1000);
    const orderData = {
      ...req.body,
      referenceId,
      client: { id: client?._id, name: client?.name },
      nanny: {
        id: nanny?._id,
        name: nanny?.name,
        distance,
        dateOfBirth: nanny?.dateOfBirth,
        rating: (nanny as INanny).rating,
      },
    };
    const order = await Order.create(orderData);
    // response
    return res.status(200).json({ success: true, message: "Order created successfully", data: order });
  } catch (error) {
    errorHandler(error as DBError, res, "Order");
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const userId = ((req as CustomRequest).user as JwtPayload)._id;
    const user = await User.findOne({ _id: userId });
    const { status, reason } = req.body;
    let order;
    const cancellationReason = reason || null;
    if (user?.type !== "Nanny") {
      if (status === "cancelled") {
        order = await Order.findOneAndUpdate({ _id }, { status, cancellationReason }, { new: true });
      } else {
        return res.status(401).json({ success: false, message: "Status can only be updated by Nanny" });
      }
    } else {
      if (STATUS.includes(status)) {
        order = await Order.findOneAndUpdate(
          { _id },
          { status, cancellationReason, $set: { "nanny.status": null } },
          { new: true }
        );
      } else if (NANNYDEST.includes(status)) {
        order = await Order.findOneAndUpdate(
          { _id },
          { status: "accepted", $set: { "nanny.status": status } },
          { new: true }
        );
      } else {
        return res.status(401).json({ success: false, message: `${status} is not a valid status` });
      }
    }
    // response
    return res.status(200).json({ success: true, message: "Order updated successfully", data: order });
  } catch (error) {
    errorHandler(error as DBError, res, "Order");
  }
};

export const getAddressBook = async (req: Request, res: Response) => {
  try {
    const id = ((req as CustomRequest).user as JwtPayload)._id;
    const orders = await Order.find({ "client.id": id }).sort({ createdAt: -1 });
    const addressBook = [];
    for (const order of orders) {
      addressBook.push(order.address);
    }
    // response
    return res.status(200).json({ success: true, message: "Address Book fetched successfully", data: addressBook });
  } catch (error) {
    errorHandler(error as DBError, res, "Order");
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const reviews = await Review.find({ nanny: _id }).sort({ createdAt: -1 });
    // response
    return res.status(200).json({ success: true, message: "Reviews fetched successfully", data: reviews });
  } catch (error) {
    errorHandler(error as DBError, res, "Review");
  }
};

export const reviewNanny = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const user = await User.findOne({ _id });
    // prevent nanny from rating nanny
    if (user?.type === "Nanny") {
      return res.status(401).json({ success: false, error: "Nanny cannot rate nannies" });
    }
    const review = await Review.create({ ...req.body, reviewer: { id: user?._id, name: user?.name } });
    // Get average rating
    let averageRating = await Review.aggregate([{ $group: { _id: req.body.nanny, average: { $avg: "$rating" } } }]);
    averageRating = averageRating[0].average.toFixed(1);
    // update nanny's average rating
    await Nanny.findOneAndUpdate({ _id: req.body.nanny }, { rating: +averageRating }, { new: true });
    // response
    return res.status(200).json({ success: true, message: "Review posted successfully", data: review });
  } catch (error) {
    errorHandler(error as DBError, res, "Review");
  }
};

export const filterNannies = async (req: Request, res: Response) => {
  try {
    const { fields, name, rating, categories } = req.query;
    const query = fields ? (fields as string).split(",").join(" ") : fields;
    const category = categories ? (categories as string).split(",").join(" ") : CATEGORIES;
    const regex = name ? new RegExp(name as string, "gi") : /^\w/;
    const nannies = await Nanny.find(
      { name: { $regex: regex, $options: "i" }, rating: { $gte: rating }, categories: { $in: category } },
      query
    ).sort({
      createdAt: -1,
    });
    // response
    return res.status(200).json({ success: true, message: "Search result retrieved", query, data: nannies });
  } catch (error) {
    errorHandler(error as DBError, res, "Nanny");
  }
};
