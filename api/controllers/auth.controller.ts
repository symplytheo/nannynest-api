import { Request, Response } from "express";
import { customAlphabet } from "nanoid/async";
import jwt, { Secret } from "jsonwebtoken";
import errorHandler, { DBError } from "../helpers/error.handler";
import Phone from "../models/phone.model";
import Client from "../models/client.model";
import config from "../config";

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
    errorHandler(error as DBError, res, "phone");
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp, code, number } = req.body;
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
    let user = await Client.findOne({ phone: { code, number } });
    let newUser = false;
    //  register user if it does not exist
    if (!user) {
      user = await Client.create({ phone: { code, number } });
      newUser = true;
    }
    // generate jwtoken
    const access_token = jwt.sign({ _id: user._id, phone: user.phone }, config.JWT_SECRET as Secret, {
      expiresIn: "7d",
    });
    // remove phone session
    await Phone.findOneAndDelete({ _id: phone._id });
    // response
    return res
      .status(200)
      .json({ success: true, message: "User authenticated successfully", data: { user, access_token, new: newUser } });
  } catch (error) {
    errorHandler(error as DBError, res, "phone");
  }
};
