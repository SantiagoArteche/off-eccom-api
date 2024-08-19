import "dotenv/config";
import jwt from "jsonwebtoken";
import { CustomError } from "../domain/errors/custom-errors";

export class Jwt {
  static createToken = (payload: any, duration: string = "2h") => {
    return new Promise((resolve) => {
      jwt.sign(
        payload as any,
        process.env.SECRET_JWT!,
        { expiresIn: duration },
        (error, token) => {
          if (error) throw CustomError.internalServer(`${error}`);

          resolve(token);
        }
      );
    });
  };

  static verifyToken = <T>(token: string): Promise<T | null> => {
    return new Promise((resolve) => {
      jwt.verify(token, process.env.SECRET_JWT!, (error, decoded) => {
        if (error) throw CustomError.internalServer(`${error}`);

        resolve(decoded as T);
      });
    });
  };
}
