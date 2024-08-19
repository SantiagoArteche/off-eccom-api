import { Bcrypt, Jwt } from "../../config/";
import { CustomError } from "../../domain/errors/custom-errors";
import { prisma } from "../../data/postgres/init";

export class AuthService {
  async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) throw CustomError.notFound("Wrong credentials");

      if (!Bcrypt.comparePasswords(password, user.password))
        throw CustomError.badRequest("Wrong credentials");

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

  async validateLogin(cookie: string) {
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

      if (!user.isValidated)
        throw CustomError.unauthorized("User not validated");

      return `User with email ${user.email} logged`;
    } catch (error) {
      throw error;
    }
  }

  async validate(token: string) {
    const tokenData = await Jwt.verifyToken<{ id: string; email: string }>(
      token
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
