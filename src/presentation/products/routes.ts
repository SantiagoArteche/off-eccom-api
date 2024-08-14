import { Router } from "express";
import { ProductsController } from "./controller";
import { ProductService } from "../services/product.service";

export class ProductRoutes {
  static get routes() {
    const router = Router();

    const productService = new ProductService();
    const productsController = new ProductsController(productService);

    router.get("/", productsController.getProducts);
    router.get("/:id", productsController.getProductById);

    router.post("/", productsController.createProduct);

    router.put("/:id", productsController.updateProduct);
    router.delete("/:id", productsController.deleteProduct);

    return router;
  }
}
