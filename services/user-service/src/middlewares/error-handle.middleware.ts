import { Request, Response } from "express";

export const errorHandler = (err: unknown, _req: Request, res: Response) => {
  const status = 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(status).json({ error: message });
};


