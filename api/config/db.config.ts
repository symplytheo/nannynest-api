import mongoose from "mongoose";
import config from ".";

const connectDataBase = async () => {
  mongoose.set("strictQuery", true);
  //
  mongoose
    .connect(config.databaseUri)
    .then(() => console.log("[DTBASE]: Connection successful"))
    .catch((err) => console.log(`[DB ERR]: ${err}`));
};

export default connectDataBase;
