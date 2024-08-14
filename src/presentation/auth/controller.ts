import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  loginUser = (req: Request, res: Response) => {
    const { email, password } = req.body;

    this.authService
      .login(email, password)
      .then((user) =>
        res
          .cookie("access_token", user.token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 120,
            sameSite: "strict",
          })
          .status(200)
          .send(user)
      )
      .catch((error) => res.status(400).send(error));
  };
}
