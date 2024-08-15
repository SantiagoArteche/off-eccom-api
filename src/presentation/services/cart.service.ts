import { prisma } from "../../data/postgres/init";
import { CreateCartItemDTO } from "../../domain/dtos/cart/create-cart-item.dto";
import { CustomError } from "../../domain/errors/custom-errors";
export class CartService {
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

      const prodInCart = await prisma.cart.findFirst({
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

      let createItem;
      if (isInCart) {
        createItem = await prisma.cartItem.update({
          where: {
            id: isInCart.id,
            productId: product?.id,
          },
          data: {
            quantity: isInCart.quantity + createCartItemDto.quantity,
          },
        });
      } else {
        createItem = await prisma.cartItem.create({
          data: {
            quantity: createCartItemDto.quantity,
            productId: product.id,
            cartId: cart.id,
          },
        });
      }

      const tax = cart.tax + createCartItemDto.quantity * product.price * 0.21;
      const subTotal =
        cart.subtotal + createCartItemDto.quantity * product.price;

      let updatedCart;
      if (!isInCart) {
        updatedCart = await prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            cartItemId: [...cart.cartItemId, createItem.id],
            subtotal: subTotal,
            tax,
            total: tax + subTotal,
          },
        });
      } else {
        updatedCart = await prisma.cart.update({
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
            `We only have ${product.stock} units, change your quantity!`
          );

        await prisma.products.update({
          where: {
            id: product.id,
          },
          data: {
            stock: product.stock - createCartItemDto.quantity,
          },
        });
      }

      return {
        msg: "Cart Updated",
        updatedCart,
      };
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
}
