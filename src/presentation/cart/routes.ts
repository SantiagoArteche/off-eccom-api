import { Router } from "express";
import { CartController } from "./controller";
import { CartService } from "../services/cart.service";

export class CartRoutes {
  static get routes() {
    const router = Router();

    const cartService = new CartService();
    const cartController = new CartController(cartService);

    router.get("/", cartController.getCarts);

    router.get("/:id", cartController.getCartById);
    router.post("/:productId/:cartId", cartController.addProductToCart);
    router.post("/:userId", cartController.createCart);
    router.delete("/:id", cartController.deleteCart);

    return router;
  }
}
