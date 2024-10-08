import { Request, Response } from "express";
import { PaginationDTO } from "../../domain/dtos";
import { OrderService } from "../services/order.service";
import { CustomError } from "../../domain/errors/custom-errors";

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  getAllOrders = (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json(error);

    this.orderService
      .getAll(paginationDto!)
      .then((orders) => res.status(200).json(orders))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  getOrderById = (req: Request, res: Response) => {
    const { id } = req.params;

    this.orderService
      .getById(id)
      .then((order) => res.status(200).json(order))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  createOrder = (req: Request, res: Response) => {
    const { cartId } = req.params;
    const { discount } = req.body;

    if (discount && isNaN(+discount))
      return res.status(400).json("Discount must be a number");

    this.orderService
      .create(cartId, discount)
      .then((order) => res.status(201).json(order))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  updateOrder = (req: Request, res: Response) => {
    const { orderId, cartId } = req.params;
    const { discount } = req.body;

    this.orderService
      .update(orderId, cartId, discount)
      .then((order) => res.status(200).json(order))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  deleteOrder = (req: Request, res: Response) => {
    const { id } = req.params;

    this.orderService
      .delete(id)
      .then((deletedOrder) => res.status(200).json(deletedOrder))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  payOrder = (req: Request, res: Response) => {
    const { id } = req.params;

    this.orderService
      .pay(id)
      .then((orderPaid) => res.status(200).json(orderPaid))
      .catch((error) => CustomError.handleErrors(error, res));
  };
}
