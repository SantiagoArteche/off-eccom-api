import { prisma } from "../../data/postgres/init";
import { Bcrypt, Jwt } from "../../config/";

export class AuthService {
  async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) return { ok: false, msg: "User not found" };

      if (!Bcrypt.compareHash(password.toString(), user.password))
        return { ok: false, msg: "Password incorrect" };

      const { password: pass, role, ...rest } = user;

      const token = await Jwt.createToken({ email: rest.email, id: rest.id });

      return { user: rest, token };
    } catch (error) {
      return { ok: false, msg: error };
    }
  }
  async validate(cookie: string) {
    const accessToken = cookie.split(";")[0];
    const tokenValue = accessToken.split("=")[1];

    const tokenData = await Jwt.verifyToken<{ id: string; email: string }>(
      tokenValue
    );

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: tokenData?.id,
          email: tokenData?.email,
        },
      });

      if (!user) return { ok: false, msg: "Error in token" };
      if (user.isValidated) return { ok: false, msg: "User already validated" };

      const updateUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isValidated: true,
        },
      });

      return { ok: true, msg: `User with email ${updateUser.email} validated` };
    } catch (error) {
      return { ok: false, msg: error };
    }
  }
}
