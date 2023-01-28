import mongoose, { Document } from "mongoose";

interface IPhone extends Document {
  code: string;
  number: string;
  otp?: string;
}

export const phoneSchema = new mongoose.Schema<IPhone>({
  code: { type: String, required: true },
  number: { type: String, required: true },
  otp: String,
});

phoneSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Phone = mongoose.model("Phone", phoneSchema);

export default Phone;
