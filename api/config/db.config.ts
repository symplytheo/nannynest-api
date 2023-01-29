import mongoose from "mongoose";
import config from ".";

const connectDataBase = async () => {
  mongoose.set("strictQuery", true);
  //
  mongoose
    .connect(config.DB_URI)
    .then(() => console.log("[DTBASE]: Connection successful"))
    .catch((err) => console.log(`[DB ERR]: ${err}`));
};

export default connectDataBase;
