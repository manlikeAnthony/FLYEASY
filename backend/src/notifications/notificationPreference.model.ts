import { Schema, model } from "mongoose";

const NotificationPreferenceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  emailEnabled: { type: Boolean, default: true },
  whatsappEnabled: { type: Boolean, default: false },
  whatsappNumber: { type: String, default: "" },
  whatsappConsentAt: { type: Date, default: null },
}, { timestamps: true });
export default model("NotificationPreference", NotificationPreferenceSchema);
