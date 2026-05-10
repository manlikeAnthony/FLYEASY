import mongoose from "mongoose";
import { log } from "node:console";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URL;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }
    await mongoose.connect(mongoUri);
    console.log("mongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed");
  }
};
