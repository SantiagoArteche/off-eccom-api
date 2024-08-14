import { prisma } from "../../data/postgres/init";
import { PaginationDTO } from "../../domain/dtos";
import { CreateProductDTO } from "../../domain/dtos/products/create-product.dto";
import { UpdateProductDTO } from "../../domain/dtos/products/update-product.dto";
import { CustomError } from "../../domain/errors/custom-errors";

export class ProductService {
  async getAll(paginationDto: PaginationDTO) {
    const { page, limit } = paginationDto;

    try {
      const [products, totalProducts] = await Promise.all([
        prisma.products.findMany({
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.products.count(),
      ]);

      return {
        currentPage: page,
        limit,
        prev:
          page <= 1 ? null : `/api/products?page=${page - 1}&limit=${limit}`,
        next: `/api/products?page=${page + 1}&limit=${limit}`,
        totalProducts,
        products,
      };
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const product = await prisma.products.findUnique({
        where: {
          id,
        },
      });

      if (!product) throw CustomError.notFound("Product not found");

      return { product };
    } catch (error) {
      throw error;
    }
  }

  async create(createProductDto: CreateProductDTO) {
    try {
      const exist = await prisma.products.findFirst({
        where: {
          name: createProductDto.name,
        },
      });

      const newProduct = await prisma.products.create({
        data: createProductDto,
      });

      return { product: newProduct };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Product with that name already exist");

      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDTO) {
    try {
      const product = await prisma.products.findUnique({
        where: {
          id,
        },
      });

      if (!product) throw CustomError.notFound("Product not found");

      const updateProduct = await prisma.products.update({
        where: {
          id: product.id,
        },
        data: { ...product, ...updateProductDto },
      });

      return {
        updatedProduct: updateProduct,
      };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Product with that name already exist");

      throw error;
    }
  }

  async delete(id: string) {
    try {
      const product = await prisma.products.delete({
        where: {
          id,
        },
      });

      return `Product with id ${product.id} was deleted`;
    } catch (error: any) {
      if (error.code === "P2025")
        throw CustomError.notFound("Product not found");

      throw error;
    }
  }
}
