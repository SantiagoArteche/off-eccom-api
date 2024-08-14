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

  async validate(token: any) {}
}
