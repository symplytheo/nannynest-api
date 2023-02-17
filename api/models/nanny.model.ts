import mongoose from "mongoose";
import User, { IUser } from "./user.model";

export interface INanny extends IUser {
  bio: string;
  rating: number;
  pronouns: string;
  languages: string[];
  nationality: string;
  experienceYears: string;
  categories: { _id: string; name: string }[];
}

const Nanny = User.discriminator(
  "Nanny",
  new mongoose.Schema<INanny>({
    bio: String,
    rating: { type: Number, required: true, default: 0 },
    pronouns: String,
    languages: [String],
    nationality: String,
    experienceYears: String,
    categories: [{ _id: String, name: String }],
  })
);

export default Nanny;
