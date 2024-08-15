import { prisma } from "../../data/postgres/init";
import { CreateCartItemDTO } from "../../domain/dtos/cart/create-cart-item.dto";
import { CustomError } from "../../domain/errors/custom-errors";
import { PaginationDTO } from "../../domain/dtos/shared/pagination.dto";
export class CartService {
  async get({ page, limit }: PaginationDTO) {
    try {
      const [allCarts, totalCarts] = await Promise.all([
        prisma.cart.findMany({
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.cart.count(),
      ]);

      return {
        currentPage: page,
        limit,
        prev: page <= 1 ? null : `/api/cart?page=${page - 1}&limit=${limit}`,
        next: `/api/cart?page=${page + 1}&limit=${limit}`,
        totalCarts,
        allCarts,
      };
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const cart = await prisma.cart.findUnique({
        where: {
          id,
        },
      });

      if (!cart) throw CustomError.notFound("Cart not found");

      return { cart };
    } catch (error) {
      throw error;
    }
  }

  async add(
    productId: string,
    cartId: string,
    createCartItemDto: CreateCartItemDTO
  ) {
    try {
      const [product, cart] = await Promise.all([
        prisma.products.findUnique({
          where: {
            id: productId,
          },
        }),
        prisma.cart.findUnique({
          where: {
            id: cartId,
          },
        }),
      ]);

      if (!product || !cart)
        throw CustomError.badRequest("Product or Cart not found");

      const addProd = await prisma.$transaction(async (transaction) => {
        const prodInCart = await transaction.cart.findFirst({
          where: {
            id: cartId,
          },
          include: {
            CartItem: {
              select: {
                productId: true,
                id: true,
                quantity: true,
              },
            },
          },
        });

        const isInCart = prodInCart?.CartItem.find(
          (prod) => prod.productId === product.id
        );

        let item;
        if (isInCart) {
          item = await transaction.cartItem.update({
            where: {
              id: isInCart.id,
              productId: product?.id,
            },
            data: {
              quantity: isInCart.quantity + createCartItemDto.quantity,
            },
          });
        } else {
          item = await transaction.cartItem.create({
            data: {
              quantity: createCartItemDto.quantity,
              productId: product.id,
              cartId: cart.id,
            },
          });
        }

        const tax =
          cart.tax + createCartItemDto.quantity * product.price * 0.21;
        const subTotal =
          cart.subtotal + createCartItemDto.quantity * product.price;

        let updatedCart;
        if (!isInCart) {
          updatedCart = await transaction.cart.update({
            where: {
              id: cart.id,
            },

            data: {
              cartItemId: [...cart.cartItemId, item.id],
              subtotal: subTotal,
              tax,
              total: tax + subTotal,
            },
          });
        } else {
          updatedCart = await transaction.cart.update({
            where: {
              id: cart.id,
            },
            data: {
              subtotal: subTotal,
              tax,
              total: tax + subTotal,
              cartItemId: cart.cartItemId,
            },
          });
        }

        if (updatedCart) {
          if (product.stock === 0)
            throw CustomError.badRequest("Product out of stock");

          if (product.stock < createCartItemDto.quantity)
            throw CustomError.badRequest(
              `We only have ${product.stock} units of ${product.name}, change your quantity!`
            );

          await transaction.products.update({
            where: {
              id: product.id,
            },
            data: {
              stock: product.stock - createCartItemDto.quantity,
            },
          });
        }

        return updatedCart;
      });

      return { msg: "Cart Updated", updatedCart: addProd };
    } catch (error) {
      throw error;
    }
  }

  async create(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user)
        throw CustomError.badRequest(
          `User with id ${userId} not found, to create a cart you need an user`
        );

      const newCart = await prisma.cart.create({
        data: {
          userId,
        },
      });

      return { msg: "Cart created!", cart: newCart };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("An user can create only one cart");

      throw error;
    }
  }

  async delete(id: string) {
    try {
      const cart = await prisma.cart.findUnique({
        where: {
          id,
        },
      });

      if (!cart) throw CustomError.notFound("Cart not found");

      cart.cartItemId.forEach(async (cartItem) => {
        await prisma.cartItem.deleteMany({
          where: {
            id: cartItem,
            cartId: cart.id,
          },
        });
      });

      await prisma.cart.delete({
        where: {
          id: cart.id,
        },
      });

      return `Cart with id ${cart.id} was deleted`;
    } catch (error) {
      throw error;
    }
  }
}
