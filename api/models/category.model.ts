import mongoose, { Document } from "mongoose";

interface ICategory extends Document {
  name: string;
  price: number;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    price: { type: Number, required: true, default: 0 },
    name: { type: String, lowercase: true, unique: true, required: false },
  },
  { timestamps: true }
);

categorySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
