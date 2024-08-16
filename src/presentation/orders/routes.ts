import { Router } from "express";
import { OrderController } from "./controller";
import { OrderService } from "../services/order.service";

export class OrderRoutes {
  static get routes() {
    const router = Router();

    const orderService = new OrderService();
    const orderController = new OrderController(orderService);

    router.get("/", orderController.getAllOrders);
    router.get("/:id", orderController.getOrderById);

    router.post("/:cartId", orderController.createOrder);
    router.post("/pay/:id", orderController.payOrder);

    router.put("/:orderId/:cartId", orderController.updateOrder);

    router.delete("/:id", orderController.deleteOrder);

    return router;
  }
}
