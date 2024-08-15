import "dotenv/config";
import bcrypt from "bcrypt";

export class Bcrypt {
  static hashPassword = (password: string) =>
    bcrypt.hashSync(password, +process.env.SALT!);

  static comparePasswords = (password: string, hashPasword: string) =>
    bcrypt.compareSync(password, hashPasword);
}
