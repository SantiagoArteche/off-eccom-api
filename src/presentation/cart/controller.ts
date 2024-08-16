import { Request, Response } from "express";
import { CartService } from "../services/cart.service";
import { CustomError } from "../../domain/errors/custom-errors";
import { CreateCartItemDTO } from "../../domain/dtos/cart/create-cart-item.dto";
import { PaginationDTO } from "../../domain/dtos";

export class CartController {
  constructor(private readonly cartService: CartService) {}

  getCarts = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const [error, paginationDto] = PaginationDTO.create(+page, +limit);
    if (error) throw CustomError.badRequest(error);

    this.cartService
      .getCarts(paginationDto!)
      .then((carts) => res.status(200).send(carts))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  getCartById = async (req: Request, res: Response) => {
    const { id } = req.params;

    this.cartService
      .getCartById(id)
      .then((cart) => res.status(200).send(cart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  addProductToCart = (req: Request, res: Response) => {
    const { productId, cartId } = req.params;
    const [error, createCartItemDto] = CreateCartItemDTO.create(req.body);

    if (error) return res.status(400).send(error);

    this.cartService
      .addProductToCart(productId, cartId, createCartItemDto!)
      .then((cart) => res.status(201).send(cart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  createCart = (req: Request, res: Response) => {
    const { userId } = req.params;

    this.cartService
      .createCart(userId)
      .then((cart) => res.status(201).send(cart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  deleteCart = (req: Request, res: Response) => {
    const { id } = req.params;

    this.cartService
      .deleteCart(id)
      .then((deletedCart) => res.status(200).send(deletedCart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  deleteCartItem = (req: Request, res: Response) => {
    const { cartId, productId } = req.params;

    this.cartService
      .deleteOneProduct(productId, cartId)
      .then((deletedItem) => res.status(200).send(deletedItem))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  removeProductFromCart = (req: Request, res: Response) => {
    const { cartId, productId } = req.params;

    this.cartService
      .removeProduct(productId, cartId)
      .then((removedItem) => res.status(200).send(removedItem))
      .catch((error) => CustomError.handleErrors(error, res));
  };
}
