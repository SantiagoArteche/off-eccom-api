import { AuthService } from "../services/auth.service";
import { CustomError } from "../../domain/errors/custom-errors";
import { Request, Response } from "express";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  loginUser = (req: Request, res: Response) => {
    const { email, password } = req.body;

    this.authService
      .login(email, password.toString())
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
      .catch((error) => CustomError.handleErrors(error, res));
  };

  validateUser = (req: Request, res: Response) => {
    const { cookie } = req.headers;

    if (!cookie) return res.status(404).send("Cookie not found");

    this.authService
      .validate(cookie)
      .then((userValidated) => res.status(200).send(userValidated))
      .catch((error) => CustomError.handleErrors(error, res));
  };
}
