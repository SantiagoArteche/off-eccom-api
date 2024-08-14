import { Router } from "express";
import { AuthController } from "./controller";
import { AuthService } from "../services/auth.service";

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const authService = new AuthService();
    const authController = new AuthController(authService);

    router.post("/login", authController.loginUser);
    router.get("/validate", authController.validateUser);

    return router;
  }
}
