import { prisma } from "../../data/postgres/init";
import { Bcrypt, Jwt } from "../../config/";
import { CustomError } from "../../domain/errors/custom-errors";

export class AuthService {
  async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) throw CustomError.notFound("User not found");

      if (!Bcrypt.compareHash(password.toString(), user.password))
        throw CustomError.badRequest("Password incorrect");

      const { password: pass, role, ...rest } = user;

      const token = await Jwt.createToken(
        { email: rest.email, id: rest.id },
        "4h"
      );

      if (!token) throw CustomError.internalServer("Error creating JWT");

      return { user: rest, token };
    } catch (error) {
      throw error;
    }
  }
  async validate(cookie: string) {
    const accessToken = cookie.split(";")[0];
    const tokenValue = accessToken.split("=")[1];

    const tokenData = await Jwt.verifyToken<{ id: string; email: string }>(
      tokenValue
    );
    if (!tokenData) throw CustomError.unauthorized("Invalid token");

    if (!tokenData.email)
      throw CustomError.internalServer("Email not in token");

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: tokenData.id,
          email: tokenData.email,
        },
      });

      if (!user) throw CustomError.badRequest("User not exists");

      if (user.isValidated)
        throw CustomError.badRequest("User already validated");

      const updateUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isValidated: true,
        },
      });

      return `User with email ${updateUser.email} validated`;
    } catch (error) {
      throw error;
    }
  }
}
