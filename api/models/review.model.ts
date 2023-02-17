import mongoose, { Document } from "mongoose";

interface IReview extends Document {
  nanny?: string;
  rating: number;
  comment: string;
  reviewer: { id: string; name: string };
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    reviewer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
      name: { type: String, required: true },
    },
    nanny: { type: mongoose.Schema.Types.ObjectId, ref: "Nanny", required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

reviewSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
