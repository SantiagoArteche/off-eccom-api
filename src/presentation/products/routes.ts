import { ProductController } from "./controller";
import { ProductService } from "../services/product.service";
import { Router } from "express";

export class ProductRoutes {
  static get routes() {
    const router = Router();

    const productService = new ProductService();
    const productController = new ProductController(productService);

    router.get("/", productController.getProducts);
    router.get("/:id", productController.getProductById);

    router.post("/", productController.createProduct);

    router.put("/:id", productController.updateProduct);

    router.delete("/:id", productController.deleteProduct);

    return router;
  }
}
