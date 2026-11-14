import Joi from "joi";
const emailSchema = Joi.string().email().max(254).required();
export const isEmail = (value: string) => !emailSchema.validate(value).error;
