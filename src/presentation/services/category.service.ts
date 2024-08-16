import { CustomError } from "../../domain/errors/custom-errors";
import { prisma } from "../../data/postgres/init";
import {
  CreateCategoryDTO,
  PaginationDTO,
  UpdateCategoryDTO,
} from "../../domain/dtos";

export class CategoryService {
  async getAll({ limit, page }: PaginationDTO) {
    try {
      const [categories, totalCategories] = await Promise.all([
        prisma.category.findMany({
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.category.count(),
      ]);

      return {
        currentPage: page,
        limit,
        prev:
          page <= 1 ? null : `/api/categories?page=${page - 1}&limit=${limit}`,
        next: `/api/categories?page=${page + 1}&limit=${limit}`,
        totalCategories,
        categories,
      };
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const category = await prisma.category.findUnique({
        where: {
          id,
        },
      });

      if (!category)
        throw CustomError.notFound(`Category with id ${id} not found`);

      return { category };
    } catch (error) {
      throw error;
    }
  }

  async create(createCategoryDto: CreateCategoryDTO) {
    try {
      const category = await prisma.category.create({
        data: createCategoryDto,
      });
      return { category };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Category already exist");

      throw error;
    }
  }

  async delete(id: string) {
    try {
      const category = await prisma.category.delete({
        where: {
          id,
        },
      });

      return `Category with id ${category.id} deleted`;
    } catch (error: any) {
      if (error.code === "P2025")
        throw CustomError.notFound("Category not found");

      throw error;
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDTO) {
    try {
      const category = await prisma.category.findUnique({
        where: {
          id,
        },
      });

      if (!category)
        throw CustomError.notFound(`Category with id ${id} not found`);

      const updateCategory = await prisma.category.update({
        where: {
          id,
        },
        data: {
          name: updateCategoryDto.name ? updateCategoryDto.name : category.name,
          createdAt: updateCategoryDto.createdAt
            ? updateCategoryDto.createdAt
            : new Date(category.createdAt),
        },
      });

      return updateCategory;
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Category with that name already exist");

      throw error;
    }
  }



}
