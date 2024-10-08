import { Response } from "express";

export class CustomError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
  }

  static badRequest(message: string) {
    return new CustomError(400, message);
  }

  static unauthorized(message: string) {
    return new CustomError(401, message);
  }
  static forbidden(message: string) {
    return new CustomError(403, message);
  }

  static notFound(message: string) {
    return new CustomError(404, message);
  }

  static internalServer(message: string) {
    return new CustomError(500, message);
  }

  static handleErrors(error: unknown, res: Response) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error.message);
    } else {
      return res.status(500).json(`Internal server error`);
    }
  }
}
