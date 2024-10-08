import { CategoryService } from "../services/category.service";
import { CreateCategoryDTO } from "../../domain/dtos/categories/create-category.dto";
import { CustomError } from "../../domain/errors/custom-errors";
import { PaginationDTO } from "../../domain/dtos";
import { Request, Response } from "express";
import { UpdateCategoryDTO } from "../../domain/dtos/categories/update-category.dto";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  getCategories = (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const [error, paginationDto] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json(error);

    this.categoryService
      .getAll(paginationDto!)
      .then((categories) => res.status(200).json(categories))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  getCategory = (req: Request, res: Response) => {
    const { id } = req.params;

    this.categoryService
      .getById(id)
      .then((category) => res.status(200).json(category))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  createCategory = (req: Request, res: Response) => {
    const [error, createCategoryDto] = CreateCategoryDTO.create(req.body);

    if (error) return res.status(400).json(error);

    this.categoryService
      .create(createCategoryDto!)
      .then((category) => res.status(201).json(category))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  updateCategory = (req: Request, res: Response) => {
    const { id } = req.params;
    const [error, updateCategoryDto] = UpdateCategoryDTO.create(req.body);

    if (error) return res.status(400).json(error);

    this.categoryService
      .update(id, updateCategoryDto!)
      .then((updatedCategory) => res.status(200).json(updatedCategory))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  deleteCategory = (req: Request, res: Response) => {
    const { id } = req.params;

    this.categoryService
      .delete(id)
      .then((deletedCategory) => res.status(200).json(deletedCategory))
      .catch((error) => CustomError.handleErrors(error, res));
  };
}
