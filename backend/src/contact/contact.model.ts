import { Schema, model } from "mongoose";

const ContactSchema = new Schema({
  key: { type: String, default: "owner", unique: true },
  email: { type: String, trim: true, lowercase: true, default: "" },
  whatsapp: { type: String, trim: true, default: "" },
}, { timestamps: true });

export default model("Contact", ContactSchema);
