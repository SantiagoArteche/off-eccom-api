import jwt from "jsonwebtoken";
import "dotenv/config";

export class Jwt {
  static createToken = <T>(payload: any, duration: string = "2h") => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload as any,
        process.env.SECRET_JWT!,
        { expiresIn: duration },
        (error, token) => {
          console.log(error);

          if (error) return reject(error);

          resolve(token);
        }
      );
    });
  };
}
