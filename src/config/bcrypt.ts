import bcrypt from "bcrypt";
import "dotenv/config";

export class Bcrypt {
  static hashPassword = (password: string) =>
    bcrypt.hashSync(password, +process.env.SALT!);

  static compareHash = (password: string, hashPasword: string) =>
    bcrypt.compareSync(password, hashPasword);
}
