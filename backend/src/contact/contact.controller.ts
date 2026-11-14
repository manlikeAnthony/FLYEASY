import { Request, Response } from "express";
import { getOwnerContactService, updateOwnerContactService } from "./contact.service";
import { successResponse } from "../response";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";

export const getOwnerContactController = async (_req: Request, res: Response) => {
  const contact = await getOwnerContactService();
  res.status(HttpCodes.OK).json(successResponse({ message: "Owner contact retrieved", data: contact, code: AppCodes.SUCCESS }));
};

export const updateOwnerContactController = async (req: Request, res: Response) => {
  const contact = await updateOwnerContactService(req.body);
  res.status(HttpCodes.OK).json(successResponse({ message: "Owner contact updated", data: contact, code: AppCodes.SUCCESS }));
};
