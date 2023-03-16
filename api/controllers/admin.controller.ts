import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Category from "../models/category.model";
import errorHandler, { DBError } from "../helpers/error.handler";
import Admin from "../models/admin.model";
import User from "../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import config from "../config";
import { CustomRequest } from "../middleware";
import { STATUS } from "../helpers/data";
import Order from "../models/order.model";
import Nanny from "../models/nanny.model";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({});
    // response
    return res.status(200).json({ success: true, message: "Categories fetched successfully", data: categories });
  } catch (error) {
    errorHandler(error as DBError, res, "Category");
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.create({ ...req.body });
    // response
    return res.status(200).json({ success: true, message: "Category created successfully", data: category });
  } catch (error) {
    errorHandler(error as DBError, res, "Category");
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const category = await Category.findOneAndUpdate({ _id }, { ...req.body }, { new: true });
    // response
    return res.status(200).json({ success: true, message: "Category updated successfully", data: category });
  } catch (error) {
    errorHandler(error as DBError, res, "Category");
  }
};

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const total_users = await User.estimatedDocumentCount();
    const total_clients = await User.estimatedDocumentCount({ type: "Client" });
    const total_nannies = await User.estimatedDocumentCount({ type: "Nanny" });
    const _total_sales = await Order.find({ status: { $in: ["ongoing", "completed"] } });
    const total_sales = Array.from(_total_sales).reduce((sum, order) => sum + order.price.subtotal, 0);
    const _total_payouts = await Order.find({ status: "completed" });
    const total_payouts = Array.from(_total_payouts).reduce((sum, order) => sum + order.price.subtotal, 0);
    const active_users = await User.estimatedDocumentCount({ suspended: false });
    const suspended_users = await User.estimatedDocumentCount({ suspended: true });
    // response
    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: { total_users, total_clients, total_nannies, total_sales, total_payouts, suspended_users, active_users },
    });
  } catch (error) {
    errorHandler(error as DBError, res, "Admin");
  }
};

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.find({}).sort({ createdAt: -1 });
    // response
    return res.status(200).json({ success: true, message: "Admins fetched successfully", data: admins });
  } catch (error) {
    errorHandler(error as DBError, res, "Admin");
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    // hash password
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const admin = await Admin.create({ ...req.body });
    // response
    return res.status(200).json({ success: true, message: "Admin added successfully", data: admin });
  } catch (error) {
    errorHandler(error as DBError, res, "Admin");
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const admin = await Admin.findOneAndUpdate({ _id }, { ...req.body }, { new: true });
    // response
    return res.status(200).json({ success: true, message: "Admin profile updated successfully", data: admin });
  } catch (error) {
    errorHandler(error as DBError, res, "Admin");
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin) {
      // verify password
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (isMatch) {
        // generate token
        const token = jwt.sign({ _id: admin._id }, config.JWT_SECRET as Secret, {});
        // response
        return res.status(200).json({ success: true, data: { admin, token } });
      } else {
        return res.status(401).json({ success: false, message: "Password is incorrect" });
      }
    } else {
      return res.status(404).json({ success: false, message: "Admin with such email does not exist" });
    }
  } catch (error) {
    errorHandler(error as DBError, res, "Admin");
  }
};

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await User.find({ type: "Client" }).sort({ createdAt: -1 });
    const total_clients = await User.estimatedDocumentCount({ type: "Client" });
    const active_clients = await User.estimatedDocumentCount({ type: "Client", suspended: false });
    const total_orders = await Order.estimatedDocumentCount({});
    const _client_payins = await Order.find({ status: "completed" });
    const total_client_payins = Array.from(_client_payins).reduce((sum, order) => sum + order.price.subtotal, 0);
    // response
    return res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      data: { total_clients, active_clients, total_orders, total_client_payins, clients },
    });
  } catch (error) {
    errorHandler(error as DBError, res, "User");
  }
};

export const getAllNannies = async (req: Request, res: Response) => {
  try {
    const nannies = await Nanny.find({}).sort({ createdAt: -1 });
    const total_nannies = await Nanny.estimatedDocumentCount();
    const available_nannies = await Nanny.estimatedDocumentCount({ available: true });
    const _total_nanny_sales = await Order.find({ status: { $in: ["ongoing", "completed"] } });
    const total_nanny_sales = Array.from(_total_nanny_sales).reduce((sum, order) => sum + order.price.subtotal, 0);
    const _total_nanny_payouts = await Order.find({ status: "completed" });
    const total_nanny_payouts = Array.from(_total_nanny_payouts).reduce((sum, order) => sum + order.price.subtotal, 0);
    // response
    return res.status(200).json({
      success: true,
      message: "Nannies fetched successfully",
      data: { total_nannies, available_nannies, total_nanny_sales, total_nanny_payouts, nannies },
    });
  } catch (error) {
    errorHandler(error as DBError, res, " Nanny");
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const { avatar, firstName, lastName } = req.body;
    const admin = await Admin.findOneAndUpdate({ _id }, { avatar, firstName, lastName }, { new: true });
    // response
    return res.status(200).json({ success: true, message: "Profile updated successfully", data: admin });
  } catch (error) {
    errorHandler(error as DBError, res, "User");
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const admin = await Admin.findOne({ _id });
    // response
    return res.status(200).json({ success: true, message: "Profile fetched successfully", data: admin });
  } catch (error) {
    errorHandler(error as DBError, res, "Admin");
  }
};

export const removeAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findOneAndRemove({ _id: id });
    // response
    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    errorHandler(error as DBError, res, "Admin");
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const _id = ((req as CustomRequest).user as JwtPayload)._id;
    const admin = await Admin.findOne({ _id });
    // verify old password
    const isMatch = await bcrypt.compare(req.body.oldPassword, admin?.password as string);
    if (isMatch) {
      // hash new password & update admin
      if (req.body.newPassword) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.newPassword, salt);
        await Admin.findOneAndUpdate({ _id }, { password });
        // response
        return res.status(200).json({ success: true, message: "Password changed successfully" });
      } else {
        return res.status(401).json({ success: false, message: "New password is required" });
      }
    } else {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }
  } catch (error) {
    errorHandler(error as DBError, res, "Admin");
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { fields, status } = req.query;
    const query = fields ? (fields as string).split(",").join(" ") : fields;
    const _status = status ? (status as string).split(",") : STATUS;
    const transactions = await Order.find({ status: { $in: _status } }, query).sort({ createdAt: -1 });
    const total_transactions = await Order.estimatedDocumentCount();
    const _total_sales = await Order.find({ status: { $in: ["completed", "ongoing"] } });
    const total_sales = Array.from(_total_sales).reduce((sum, order) => sum + order.price.subtotal, 0);
    const _total_payouts = await Order.find({ status: "completed" });
    const total_payouts = Array.from(_total_payouts).reduce((sum, order) => sum + order.price.subtotal, 0);
    // response
    return res.status(200).json({
      success: true,
      message: "All transactions fetched successfully",
      query,
      data: { total_transactions, total_sales, total_payouts, transactions },
    });
  } catch (error) {
    errorHandler(error as DBError, res, "Order");
  }
};

export const getNannyOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fields, status } = req.query;
    const query = fields ? (fields as string).split(",").join(" ") : fields;
    const _status = status ? (status as string).split(",") : STATUS;
    const orders = await Order.find({ "nanny.id": id, status: { $in: _status } }, query).sort({ createdAt: -1 });
    const completed = await Order.find({ "nanny.id": id, status: "completed" });
    const total_amount_made = Array.from(completed).reduce((sum, order) => sum + order.price.subtotal, 0);
    const total_completed = Array.from(completed).length;
    const total_cancelled = await Order.estimatedDocumentCount({
      "nanny.id": id,
      status: { $in: ["cancelled", "rejected"] },
    });
    // response
    return res.status(200).json({
      success: true,
      message: "Nanny's orders fetched successfully",
      query,
      data: { total_completed, total_cancelled, total_amount_made, orders },
    });
  } catch (error) {
    errorHandler(error as DBError, res, "Order");
  }
};

export const getClientOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fields, status } = req.query;
    const query = fields ? (fields as string).split(",").join(" ") : fields;
    const _status = status ? (status as string).split(",") : STATUS;
    const orders = await Order.find({ "client.id": id, status: { $in: _status } }, query).sort({ createdAt: -1 });
    // response
    return res
      .status(200)
      .json({ success: true, message: "Client's orders fetched successfully", query, data: orders });
  } catch (error) {
    errorHandler(error as DBError, res, "Order");
  }
};

export const getSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fields } = req.query;
    const query = fields ? (fields as string).split(",").join(" ") : fields;
    const user = await User.findOne({ _id: id }, query).sort();
    // response
    return res.status(200).json({ success: true, message: `${user?.type} fetched successfully`, query, data: user });
  } catch (error) {
    errorHandler(error as DBError, res, "User");
  }
};

export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { suspended } = req.body;
    suspended = ["true", true].includes(suspended.toLowerCase()) ? true : false;
    const user = await User.findOneAndUpdate({ _id: id }, { suspended }, { new: true });
    // response
    return res.status(200).json({ success: true, message: "User has been suspended", data: user });
  } catch (error) {
    errorHandler(error as DBError, res, "User");
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findOneAndDelete({ _id: id });
    // response
    return res.status(200).json({ success: true, message: "User removed successfully" });
  } catch (error) {
    errorHandler(error as DBError, res, "User");
  }
};
