import { Router } from "express";
import { UserRouter } from "./users/routes";

export class AppRoutes {
  static get routes() {
    const router = Router();

    router.use("/api/users", UserRouter.routes);

    return router;
  }
}
