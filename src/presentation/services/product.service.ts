import { CreateProductDTO } from "../../domain/dtos/products/create-product.dto";
import { CustomError } from "../../domain/errors/custom-errors";
import { PaginationDTO } from "../../domain/dtos";
import { prisma } from "../../data/postgres/init";
import { UpdateProductDTO } from "../../domain/dtos/products/update-product.dto";

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

      if (!product)
        throw CustomError.notFound(`Product with id ${id} not found`);

      return { product };
    } catch (error) {
      throw error;
    }
  }

  async create(createProductDto: CreateProductDTO) {
    try {
      const newProduct = await prisma.products.create({
        data: createProductDto,
      });

      return { product: newProduct };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Product with that name already exist");

      if (error.code === "P2003")
        throw CustomError.badRequest("Category not exists");

      throw error;
    }
  }

  async update(
    id: string,
    { category, lowStock, name, price, stock, createdAt }: UpdateProductDTO
  ) {
    try {
      const product = await prisma.products.findUnique({
        where: {
          id,
        },
      });

      if (!product)
        throw CustomError.notFound(`Product with id ${id} not found`);

      const updateProduct = await prisma.products.update({
        where: {
          id: product.id,
        },
        data: {
          category: category ? category : product.category,
          lowStock: lowStock !== null ? lowStock : product.lowStock,
          name: name ? name : product.name,
          price: price ? price : product.price,
          stock: stock ? stock : product.stock,
          createdAt: createdAt ? createdAt : product.createdAt,
        },
      });

      return {
        updatedProduct: { ...updateProduct },
      };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Product with that name already exist");

      if (error.code === "P2003")
        throw CustomError.badRequest("Category not exists");

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
