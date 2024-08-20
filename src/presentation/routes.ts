import { AuthRoutes } from "./auth/routes";
import { CartRoutes } from "./cart/routes";
import { CategoryRoutes } from "./categories/routes";
import { OrderRoutes } from "./orders/routes";
import { ProductRoutes } from "./products/routes";
import { Router } from "express";
import { UserRoutes } from "./users/routes";
import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export class AppRoutes {
  static get routes() {
    const router = Router();
    const options = {
      definition: {
        info: {
          title: "OFF API",
          version: "0.0.1",
          description: "API made for OFF E-Commerce",

          contact: {
            name: "Santiago Arteche",
            url: "https://portfolioarteche.vercel.app/",
            email: "santiagoarteche7@gmail.com",
          },
        },
        openapi: "3.1.0",
        servers: [
          {
            url: "http://localhost:7070/",
          },
        ],
      },
      apis: [`${__dirname}/docs/*.yaml`],
    };

    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/cart", CartRoutes.routes);
    router.use("/api/categories", CategoryRoutes.routes);
    router.use("/api/products", ProductRoutes.routes);
    router.use("/api/users", UserRoutes.routes);
    router.use("/api/orders", OrderRoutes.routes);

    router.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerjsdoc(options))
    );

    return router;
  }
}
