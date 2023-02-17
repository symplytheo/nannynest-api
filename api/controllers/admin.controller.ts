import { Request, Response } from "express";
import Category from "../models/category.model";
import errorHandler, { DBError } from "../helpers/error.handler";

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
