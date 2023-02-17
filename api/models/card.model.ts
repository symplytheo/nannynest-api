import mongoose, { Document } from "mongoose";

interface ICard extends Document {
  client?: string;
  number: string | number;
  expiry: string;
  cvv: string; // converted to hexa or hashed or tokened
  verified: boolean;
}

const cardSchema = new mongoose.Schema<ICard>(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    number: { type: String || Number, unique: true, required: true },
    expiry: { type: String, required: false },
    cvv: { type: String, required: false },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

cardSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.cvv; // do not reveal cvv to frontend
  },
});

const Card = mongoose.model("Card", cardSchema);

export default Card;
