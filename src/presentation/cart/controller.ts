import { Request, Response } from "express";
import { CartService } from "../services/cart.service";
import { CustomError } from "../../domain/errors/custom-errors";
import { CreateCartItemDTO } from "../../domain/dtos/cart/create-cart-item.dto";

export class CartController {
  constructor(private readonly cartService: CartService) {}

  addProductToCart = (req: Request, res: Response) => {
    const { productId, cartId } = req.params;
    const [error, createCartItemDto] = CreateCartItemDTO.create(req.body);

    if (error) return res.status(400).send(error);

    this.cartService
      .add(productId, cartId, createCartItemDto!)
      .then((cart) => res.status(201).send(cart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  createCart = (req: Request, res: Response) => {
    const { userId } = req.params;

    this.cartService
      .create(userId)
      .then((cart) => res.status(201).send(cart))
      .catch((error) => CustomError.handleErrors(error, res));
  };
}
