import { OWNER_CONTACT } from "../config/owner";
import { isEmail } from "../utils/email/isEmail";
import Contact from "./contact.model";
import { CustomError } from "../errors/CustomError";
import { HttpCodes } from "../errors/HttpCodes";
import { AppCodes } from "../errors/AppCodes";

export const getOwnerContactService = async () => {
  const saved = await Contact.findOne({ key: "owner" }).lean();
  const email = saved?.email || process.env.OWNER_CONTACT_EMAIL || OWNER_CONTACT.email;
  const whatsapp = saved ? saved.whatsapp : process.env.OWNER_WHATSAPP_NUMBER || OWNER_CONTACT.whatsapp;
  return {
    email: isEmail(email) ? email : "",
    whatsapp: /^\+[1-9]\d{7,14}$/.test(whatsapp) ? whatsapp : "",
  };
};

export const updateOwnerContactService = async (input: { email?: unknown; whatsapp?: unknown }) => {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const whatsapp = typeof input.whatsapp === "string" ? input.whatsapp.trim() : "";
  if (!isEmail(email) || (whatsapp && !/^\+[1-9]\d{7,14}$/.test(whatsapp))) {
    CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.INVALID_INPUT, "Enter the owner’s email and a WhatsApp number with country code, such as +234…");
  }
  await Contact.findOneAndUpdate({ key: "owner" }, { $set: { email, whatsapp } }, { upsert: true, new: true, runValidators: true });
  return { email, whatsapp };
};
