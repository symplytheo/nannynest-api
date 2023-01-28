import mongoose, { Document } from "mongoose";
import { phoneSchema } from "./phone.model";

interface IClient extends Document {
  name?: string;
  email?: string;
  avatar?: string;
  location?: string;
  phone: { code: string; number: string };
  socials?: { facebook: string; twitter: string; instagram: string; linkedin: string };
  dateOfBirth?: number;
  otp?: string;
}

const clientSchema = new mongoose.Schema<IClient>(
  {
    name: String,
    phone: { type: phoneSchema, unique: true },
    email: { type: String, unique: false },
    avatar: String,
    dateOfBirth: String,
    location: String,
    socials: { facebook: String, twitter: String, instagram: String, linkedin: String },
    otp: String,
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);

export default Client;
