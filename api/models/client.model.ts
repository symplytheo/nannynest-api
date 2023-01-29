import mongoose, { Document } from "mongoose";

interface IClient extends Document {
  name?: string;
  email?: string;
  avatar?: string;
  location?: string;
  phone: { code: string; number: string };
  socials?: { facebook: string; twitter: string; instagram: string; linkedin: string };
  dateOfBirth?: string;
  otp?: string;
}

const clientSchema = new mongoose.Schema<IClient>(
  {
    name: String,
    phone: { code: { type: String, required: true }, number: { type: String, required: true } },
    email: { type: String, unique: false },
    avatar: String,
    dateOfBirth: String,
    location: String,
    socials: { facebook: String, twitter: String, instagram: String, linkedin: String },
    otp: String,
  },
  { timestamps: true }
);

clientSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Client = mongoose.model("Client", clientSchema);

export default Client;
