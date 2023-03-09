import mongoose, { Document } from "mongoose";
import { NANNYDEST, STATUS } from "../helpers/data";

interface IOrder extends Document {
  referenceId: string;
  status: "pending" | "completed" | "rejected" | "accepted" | "cancelled" | "ongoing";
  price: { subtotal: number; transportation: number; total: number };
  address: { latitude: number; longitude: number };
  estimatedArrivalTime?: number; // in minutes
  paymentMethod: string;
  client: { id: string; name: string };
  nanny: {
    id: string;
    name: string;
    dateOfBirth: string;
    rating: number;
    status: "on my way" | "arrived";
    distance: string | number;
  };
  beneficiaries: { name: string; quantity: number }[];
  comment?: string;
  cancellationReason: string;
  start: { date: string; time: string };
  end: { date: string; time: string };
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    referenceId: { type: String, required: true },
    start: { date: String, time: String },
    end: { date: String, time: String },
    status: { type: String, enum: STATUS, default: "pending" },
    price: {
      subtotal: { type: Number, default: 0 },
      transportation: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    address: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
    estimatedArrivalTime: { type: Number, default: 15 },
    paymentMethod: String,
    client: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
      name: { type: String, required: true },
    },
    nanny: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Nanny", required: true },
      name: { type: String, required: true },
      dateOfBirth: { type: String, required: true },
      rating: { type: Number, required: true },
      distance: String || Number,
      status: { type: String, enum: NANNYDEST, default: null },
    },
    beneficiaries: [{ name: String, quantity: Number }],
    comment: String,
    cancellationReason: String,
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
