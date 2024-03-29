import express, { Express, Response, Request } from "express";
import connectDataBase from "./config/db.config";
import authRouter from "./routes/auth.route";
import config from "./config";
import adminRouter from "./routes/admin.route";
import orderRouter from "./routes/order.route";

const app: Express = express();

const PORT = config.PORT || 5000;

// connect database
connectDataBase();

// parse application/json
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// ROUTES
// welcome-route
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Welcome to Nannynest API" });
});
// authentication route
app.use("/auth", authRouter);
// order route
app.use("/orders", orderRouter);
// admin route
app.use("/admin", adminRouter);

// listener
app.listen(PORT, () => {
  console.log(`[SERVER]: Listening at localhost:${PORT}`);
});
