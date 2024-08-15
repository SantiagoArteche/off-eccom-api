import { CustomError } from "../../domain/errors/custom-errors";
import { ProductService } from "../services/product.service";
import { Request, Response } from "express";
import {
  CreateProductDTO,
  UpdateProductDTO,
  PaginationDTO,
} from "../../domain/dtos";

export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  getProducts = (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).send(error);

    this.productService
      .getAll(paginationDto!)
      .then((products) => res.status(200).send(products))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  getProductById = (req: Request, res: Response) => {
    const { id } = req.params;

    this.productService
      .getById(id)
      .then((product) => res.status(200).send(product))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  createProduct = (req: Request, res: Response) => {
    const [error, createProductDto] = CreateProductDTO.create(req.body);

    if (error) return res.status(400).send(error);

    this.productService
      .create(createProductDto!)
      .then((newProd) => res.status(201).send(newProd))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  updateProduct = (req: Request, res: Response) => {
    const { id } = req.params;
    const [error, updateProductDto] = UpdateProductDTO.create(req.body);

    if (error) return res.status(400).send(error);

    this.productService
      .update(id, updateProductDto!)
      .then((updatedProd) => res.status(201).send(updatedProd))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  deleteProduct = (req: Request, res: Response) => {
    const { id } = req.params;

    this.productService
      .delete(id)
      .then((deleted) => res.status(200).send(deleted))
      .catch((error) => CustomError.handleErrors(error, res));
  };
}
