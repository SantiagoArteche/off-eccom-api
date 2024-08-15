import { AuthRoutes } from "./auth/routes";
import { CategoryRoutes } from "./categories/routes";
import { ProductRoutes } from "./products/routes";
import { Router } from "express";
import { UserRoutes } from "./users/routes";
import { CartRoutes } from "./cart/routes";

export class AppRoutes {
  static get routes() {
    const router = Router();

    router.use("/api/users", UserRoutes.routes);
    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/products", ProductRoutes.routes);
    router.use("/api/categories", CategoryRoutes.routes);
    router.use("/api/cart", CartRoutes.routes);

    return router;
  }
}
