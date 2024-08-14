import { Router } from "express";
import { UserRoutes } from "./users/routes";
import { AuthRoutes } from "./auth/routes";

export class AppRoutes {
  static get routes() {
    const router = Router();

    router.use("/api/users", UserRoutes.routes);
    router.use("/api/auth", AuthRoutes.routes);

    return router;
  }
}
