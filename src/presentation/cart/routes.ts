import { CartController } from "./controller";
import { CartService } from "../services/cart.service";
import { Router } from "express";

export class CartRoutes {
  static get routes() {
    const router = Router();

    const cartService = new CartService();
    const cartController = new CartController(cartService);

    router.get("/", cartController.getCarts);

    router.get("/:id", cartController.getCartById);
    router.delete("/:id", cartController.deleteCart);

    router.post("/:userId", cartController.createCart);

    router.put("/:productId/:cartId", cartController.addProductToCart);
    router.delete("/:productId/:cartId", cartController.deleteCartItem);

    router.delete(
      "/removeproduct/:productId/:cartId",
      cartController.removeProductFromCart
    );

    return router;
  }
}
