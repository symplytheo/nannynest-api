import mongoose, { Document } from "mongoose";

interface IBank extends Document {
  nanny?: string;
  number: string | number;
  name: string;
  bank: string;
  active: boolean;
}

const bankSchema = new mongoose.Schema<IBank>(
  {
    nanny: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    number: { type: String || Number, required: true },
    name: { type: String, required: true },
    bank: { type: String, required: true },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bankSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Bank = mongoose.model("Bank", bankSchema);

export default Bank;
