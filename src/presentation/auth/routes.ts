import { AuthController } from "./controller";
import { AuthService } from "../services/auth.service";
import { Router } from "express";

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const authService = new AuthService();
    const authController = new AuthController(authService);

    router.get("/login", authController.validateLogin);
    router.get("/validate/:token", authController.validateUser);

    router.post("/login", authController.loginUser);

    return router;
  }
}
