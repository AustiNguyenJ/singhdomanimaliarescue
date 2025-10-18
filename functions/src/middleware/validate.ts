import type { NextFunction, Request, Response } from "express";
import { NotificationCreateSchema } from "../models/notification";

export function validateNotificationBody(req: Request, res: Response, next: NextFunction) {
  try {
    NotificationCreateSchema.parse(req.body);
    next();
  } catch (e: any) {
    return res.status(400).json({ error: "VALIDATION_ERROR", details: e.errors ?? String(e) });
  }
}
