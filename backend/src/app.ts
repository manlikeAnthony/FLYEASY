import express from "express";
import { notFound } from "./middlewares/not-found";
import { errorHandlerMiddleware } from "./middlewares/error-handler";
import cookieParser from "cookie-parser";
import morgan from "morgan";
// Routes
import authRouter from "./auth/auth.route";
import userRouter from "./users/user.route";
import requestRouter from "./request/request.route";

import cors from "cors";
const app = express();

app.set("trust proxy", 1);
// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:5173",
  "https://flyeasy-ng-ui.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "FlyEasy API is running",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/requests", requestRouter);

app.use(notFound);
app.use(errorHandlerMiddleware);

export default app;
