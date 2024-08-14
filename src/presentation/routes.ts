import { Router } from "express";
import { UserRoutes } from "./users/routes";
import { AuthRoutes } from "./auth/routes";
import { ProductRoutes } from "./products/routes";
import { CategoryRoutes } from "./categories/routes";

export class AppRoutes {
  static get routes() {
    const router = Router();

    router.use("/api/users", UserRoutes.routes);
    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/products", ProductRoutes.routes);
    router.use("/api/categories", CategoryRoutes.routes);

    return router;
  }
}
