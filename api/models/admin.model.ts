import mongoose, { Document } from "mongoose";

interface IAdmin extends Document {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  email: string;
  password: string;
  role: "Admin";
}

const adminSchema = new mongoose.Schema<IAdmin>(
  {
    firstName: String,
    lastName: String,
    avatar: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin"], required: true, default: "Admin" },
  },
  { timestamps: true }
);

adminSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
