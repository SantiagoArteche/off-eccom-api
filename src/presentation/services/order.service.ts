import { prisma } from "../../data/postgres/init";
import { PaginationDTO } from "../../domain/dtos";
import { CustomError } from "../../domain/errors/custom-errors";

export class OrderService {
  async getAll({ page, limit }: PaginationDTO) {
    try {
      const [orders, totalOrders] = await Promise.all([
        prisma.order.findMany({
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.order.count(),
      ]);

      return {
        currentPage: page,
        limit,
        prev: page <= 1 ? null : `/api/orders?page=${page - 1}&limit=${limit}`,
        next: `/api/orders?page=${page + 1}&limit=${limit}`,
        totalOrders,
        orders,
      };
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const order = await prisma.order.findUnique({
        where: {
          id,
        },
      });

      if (!order) CustomError.notFound(`Order with id ${id} not found`);

      return { order };
    } catch (error) {
      throw error;
    }
  }

  async create(cartId: string, discount: number) {
    try {
      let setDiscount = discount;
      if (discount < 10 || discount > 99) {
        if (discount < 0 || discount > 99) {
          discount = 0;
        } else {
          discount = +`0.0${setDiscount}`;
        }
      } else {
        discount = +`0.${setDiscount}`;
      }

      const transaction = await prisma.$transaction(async (tx) => {
        const exist = await tx.order.findFirst({
          where: {
            cartId: cartId,
          },
        });

        if (exist) throw CustomError.badRequest("You only can make one order");

        const cart = await tx.cart.update({
          where: {
            id: cartId,
          },
          data: {
            placeOrder: true,
          },
          include: {
            CartItem: {
              include: {
                product: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        });

        if (cart.total === 0)
          throw CustomError.badRequest(
            "Insert products to your cart before make an order!"
          );

        const order = tx.order.create({
          data: {
            cartId: cart.id,
            discount: setDiscount < 0 || setDiscount > 99 ? 0 : setDiscount,
            finalPrice: cart.total - cart.total * Number(discount),
            itemsInOrder: cart.CartItem.map((item) => {
              return {
                name: item.product.name,
                quantity: item.quantity,
              };
            }),
          },
          include: {
            cart: {
              select: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });

        return order;
      });

      const { cart, ...rest } = transaction;

      return { order: rest, userId: cart?.user.id };
    } catch (error: any) {
      if (error.code === "P2025") throw CustomError.notFound("Cart not found");

      throw error;
    }
  }

  async pay(id: string) {
    try {
      const order = await prisma.order.findUnique({
        where: {
          id,
        },
        include: {
          cart: true,
        },
      });

      if (!order) throw CustomError.notFound(`Order with id ${id} not found`);

      const paidOrder = await prisma.$transaction(async (tx) => {
        order.cart?.cartItemId.forEach(async (itemId) => {
          await tx.cartItem.delete({
            where: {
              id: itemId,
            },
          });
        });

        if (!order.cartId)
          throw CustomError.internalServer("Order already paid!");

        await tx.cart.delete({
          where: {
            id: order.cartId,
          },
        });

        return tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            paidAt: new Date(),
          },
        });
      });

      return { msg: `Order with id ${order.id} paid!`, paidOrder };
    } catch (error) {
      throw error;
    }
  }

  async update(orderId: string, cartId: string, discount?: number) {
    try {
      const [order, cart] = await Promise.all([
        prisma.order.findUnique({
          where: {
            id: orderId,
          },
        }),
        prisma.cart.findUnique({
          where: {
            id: cartId,
          },
          include: {
            CartItem: {
              include: {
                product: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      if (!order || !cart)
        throw CustomError.notFound(`Order or cart not found`);
      if (order.cartId === null)
        throw CustomError.badRequest(`Order already paid`);

      let handleDiscount = discount;
      if (discount) {
        if (discount < 10 || discount > 99) {
          if (discount < 0 || discount > 99) {
            discount = 0;
          } else {
            discount = +`0.0${discount}`;
          }
        } else {
          discount = +`0.${discount}`;
        }
      }

      if (discount === 0 || discount === undefined) handleDiscount = 0;

      const updateOrder = await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          discount:
            discount || discount === 0 ? handleDiscount : order.discount,
          finalPrice:
            discount || discount === 0
              ? cart.total - cart.total * Number(discount)
              : cart.total -
                cart.total *
                  Number(
                    order.discount < 10
                      ? `0.0${order.discount}`
                      : `0.${order.discount}`
                  ),
          itemsInOrder: cart.CartItem.map((item) => {
            return {
              name: item.product.name,
              quantity: item.quantity,
            };
          }),
        },
      });

      return { updatedOrder: updateOrder };
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const order = await prisma.order.findUnique({
        where: {
          id,
        },
      });

      if (!order) throw CustomError.notFound(`Order with id ${id} not found`);
      if (order.cartId === null)
        throw CustomError.badRequest(
          `Order already paid, wait until the products arrive to the client and contact the DB Admin to delete the order. We recommend not delete any orders which was completed`
        );

      await prisma.order.delete({
        where: {
          id: order.id,
        },
      });

      return `Order with id ${id} was deleted`;
    } catch (error) {
      throw error;
    }
  }
}
