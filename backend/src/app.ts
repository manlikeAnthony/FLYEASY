import express from "express";
import notificationRouter from "./notifications/notification.route";
import contactRouter from "./contact/contact.route";
import { analyticsRouter } from "./request/analytics";
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

const environmentOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
]
  .flatMap((value) => value?.split(",") || [])
  .map((value) => value.trim().replace(/\/$/, ""));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://flyeasy-ng-ui.netlify.app",
  "https://flyeasy.jade2solutions.com",
  ...environmentOrigins,
].filter((origin): origin is string => Boolean(origin));

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
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  })
);
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "FlyEasy API is running",
  });
});

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "FlyEasy API is healthy",
  });
});

// Routes

app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/requests", requestRouter);
app.use("/api/v1/analytics", analyticsRouter);

app.use(notFound);
app.use(errorHandlerMiddleware);

export default app;
