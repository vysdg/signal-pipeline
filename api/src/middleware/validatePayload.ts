import { Request, Response, NextFunction } from "express";
import { LeadSchema } from "../types/lead";
import { ZodError } from "zod";

export function validatePayload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    req.body = LeadSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(422).json({ error: "Invalid payload", details: err.issues });
      return;
    }
    next(err);
  }
}
