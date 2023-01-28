import { Request, Response } from "express";
import { customAlphabet } from "nanoid/async";
import errorHandler, { DBError } from "../helpers/error.handler";
import Phone from "../models/phone.model";

export const submitPhoneNumber = async (req: Request, res: Response) => {
  try {
    const { code, number } = req.body;
    // generate otp
    const nanoid = customAlphabet("1234567890", 4);
    const otp = await nanoid();
    // update or create phone auth session
    const phone = await Phone.findOneAndUpdate({ code, number }, { otp }, { upsert: true, new: true });
    // response
    return res.status(200).json({ success: true, message: `OTP sent to +${code + "" + number}`, data: phone });
  } catch (error) {
    errorHandler(error as DBError, res, "phone");
  }
};
