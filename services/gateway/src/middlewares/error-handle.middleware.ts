import { Request, Response, NextFunction } from "express";
import { BaseException } from "@shared/exception";

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof BaseException) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      code: error.errorCode,
      timestamp: new Date().toISOString(),
      path: _req.url,
    });
  }

  console.error(error);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    code: "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
    path: _req.url,
  });
}
