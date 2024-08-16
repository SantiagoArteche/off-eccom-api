import { AuthRoutes } from "./auth/routes";
import { CartRoutes } from "./cart/routes";
import { CategoryRoutes } from "./categories/routes";
import { OrderRoutes } from "./orders/routes";
import { ProductRoutes } from "./products/routes";
import { Router } from "express";
import { UserRoutes } from "./users/routes";

export class AppRoutes {
  static get routes() {
    const router = Router();

    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/cart", CartRoutes.routes);
    router.use("/api/categories", CategoryRoutes.routes);
    router.use("/api/products", ProductRoutes.routes);
    router.use("/api/users", UserRoutes.routes);
    router.use("/api/orders", OrderRoutes.routes);

    return router;
  }
}
