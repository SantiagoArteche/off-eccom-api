import { CartService } from "../services/cart.service";
import { CreateCartItemDTO, PaginationDTO } from "../../domain/dtos";
import { CustomError } from "../../domain/errors/custom-errors";
import { Request, Response } from "express";

export class CartController {
  constructor(private readonly cartService: CartService) {}

  getCarts = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const [error, paginationDto] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json(error);

    this.cartService
      .getCarts(paginationDto!)
      .then((carts) => res.status(200).json(carts))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  getCartById = async (req: Request, res: Response) => {
    const { id } = req.params;

    this.cartService
      .getCartById(id)
      .then((cart) => res.status(200).json(cart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  addProductToCart = (req: Request, res: Response) => {
    const { productId, cartId } = req.params;
    const [error, createCartItemDto] = CreateCartItemDTO.create(req.body);

    if (error) return res.status(400).json(error);

    this.cartService
      .addProductToCart(productId, cartId, createCartItemDto!)
      .then((cart) => res.status(200).json(cart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  createCart = (req: Request, res: Response) => {
    const { userId } = req.params;

    this.cartService
      .createCart(userId)
      .then((cart) => res.status(201).json(cart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  deleteCart = (req: Request, res: Response) => {
    const { id } = req.params;

    this.cartService
      .deleteCart(id)
      .then((deletedCart) => res.status(200).json(deletedCart))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  deleteCartItem = (req: Request, res: Response) => {
    const { cartId, productId } = req.params;

    this.cartService
      .deleteOneProduct(productId, cartId)
      .then((deletedItem) => res.status(200).json(deletedItem))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  removeProductFromCart = (req: Request, res: Response) => {
    const { cartId, productId } = req.params;

    this.cartService
      .removeProduct(productId, cartId)
      .then((removedItem) => res.status(200).json(removedItem))
      .catch((error) => CustomError.handleErrors(error, res));
  };
}
