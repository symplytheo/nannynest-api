import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  avatar?: string;
  location: { lat: number; long: number };
  phone: { code: string; number: string };
  socials?: { facebook: string; twitter: string; instagram: string; linkedin: string };
  dateOfBirth?: string;
  paymentMethod?: string;
  type?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: String,
    phone: { code: { type: String, required: true }, number: { type: String, required: true } },
    email: String,
    avatar: String,
    dateOfBirth: String,
    location: { lat: { type: Number, default: 0 }, long: { type: Number, default: 0 } },
    paymentMethod: String, // cash or card number
    socials: { facebook: String, twitter: String, instagram: String, linkedin: String },
    type: { type: String, default: "Client" },
  },
  { timestamps: true, discriminatorKey: "type" }
);

userSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.otp;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
