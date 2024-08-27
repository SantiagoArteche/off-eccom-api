import { prisma } from "../../../../src/data/postgres/init";
import { OrderService } from "../../../../src/presentation/services/order.service";
export const OrderTest = describe("tests on order.service.ts", () => {
  let service: OrderService;
  let order: any;
  let cart: any;
  let user: any;
  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        lastName: "test",
        age: 22,
        firstName: "test",
        email: "test@hotmail.com",
        password: "123456",
      },
    });

    cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    await prisma.category.create({
      data: {
        name: "newCategory",
      },
    });
    const product = await prisma.products.create({
      data: {
        category: "newCategory",
        name: "newProduct",
        stock: 20,
        lowStock: false,
        price: 1500,
      },
    });

    const { id: cartItemId, quantity } = await prisma.cartItem.create({
      data: {
        quantity: 1,
        productId: product.id,
        cartId: cart.id,
      },
    });

    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        cartItemId: [cartItemId],
        total: product.price + product.price * 0.21,
        subtotal: product.price,
        tax: product.price * 0.21,
      },
    });

    order = await prisma.order.create({
      data: {
        discount: 0,
        finalPrice: product.price + product.price * 0.21,
        createdAt: new Date(),
        paidBy: null,
        cartId: cart.id,
        itemsInOrder: [
          {
            name: product.name,
            quantity,
          },
        ],
      },
    });

    service = new OrderService();
  });

  afterEach(async () => {
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.order.deleteMany({});
  });
  test("must create an instance of order service", () => {
    expect(service).toBeInstanceOf(OrderService);
    expect(service).toHaveProperty("create");
    expect(service).toHaveProperty("getAll");
    expect(service).toHaveProperty("getById");
    expect(service).toHaveProperty("pay");
    expect(service).toHaveProperty("update");
    expect(service).toHaveProperty("delete");
    expect(typeof service.create).toBe("function");
    expect(typeof service.delete).toBe("function");
    expect(typeof service.getAll).toBe("function");
    expect(typeof service.getById).toBe("function");
    expect(typeof service.pay).toBe("function");
    expect(typeof service.update).toBe("function");
  });

  test("getAll must return an object with page, limit, prev , next, totalOrders and orders", async () => {
    const mockObject = { limit: 10, page: 1 };
    try {
      const allOrders = await service.getAll(mockObject);
      expect(allOrders).toBeTruthy();
      expect(allOrders).toEqual({
        currentPage: 1,
        limit: 10,
        next: "/api/orders?page=2&limit=10",
        prev: null,
        orders: [expect.any(Object)],
        totalOrders: expect.any(Number),
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getAll must fail if wrong values are provided", async () => {
    const mockObject = { limit: "?", page: 1 };
    try {
      await service.getAll(mockObject as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("getById must return the order found", async () => {
    try {
      const orderById = await service.getById(order.id);
      expect(orderById).toBeTruthy();
      expect(orderById).toEqual({
        order: {
          cartId: expect.any(String),
          createdAt: expect.any(Date),
          discount: 0,
          finalPrice: 1815,
          id: expect.any(String),
          itemsInOrder: [{ name: "newProduct", quantity: 1 }],
          paidBy: null,
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getById must return an error if order not found", async () => {
    const id = "a6c02b5-c8df-4405-b607-75a4aa9c557e";
    try {
      await service.getById(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(`Error: Order with id ${id} not found`);
    }
  });

  test("getById must fail if a wrong value is provided", async () => {
    const id = 4343;
    try {
      await service.getById(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain(`Invalid value provided`);
    }
  });

  test("create must return the order and the id user", async () => {
    try {
      await prisma.order.deleteMany();
      const order = await service.create(cart.id, 0);
      expect(order).toBeTruthy();
      expect(order).toEqual({
        order: {
          id: expect.any(String),
          cartId: expect.any(String),
          createdAt: expect.any(Date),
          discount: 0,
          finalPrice: 1815,
          itemsInOrder: [
            {
              name: "newProduct",
              quantity: 1,
            },
          ],
          paidBy: null,
        },
        userId: expect.any(String),
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("create must return an error if the cart already made an order", async () => {
    try {
      await service.create(cart.id, 0);
      expect(order).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        "Error: You only can make one order at time"
      );
    }
  });

  test("create must return an error if the cart dont have any products", async () => {
    try {
      await prisma.order.deleteMany();
      await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          total: 0,
        },
      });
      const order = await service.create(cart.id, 0);
      expect(order).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        "Error: Insert products to your cart before make an order!"
      );
    }
  });

  test("create must return an error if the cart not found", async () => {
    const id = "a6c02b5-c8df-4405-b607-75a4aa9c557e";
    try {
      const order = await service.create(id, 0);
      expect(order).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Cart not found");
    }
  });

  test("create must fail if wrong values are provided", async () => {
    try {
      await prisma.order.deleteMany();
      const order = await service.create(3434 as any, "reded" as any);
      expect(order).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("pay must return an object with msg and paid order", async () => {
    try {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isValidated: true,
        },
      });
      const paidOrder = await service.pay(order.id);
      expect(paidOrder).toBeTruthy();
      expect(paidOrder).toEqual({
        msg: `Order with id ${order.id} was paid!`,
        paidOrder: {
          cartId: null,
          createdAt: expect.any(Date),
          discount: expect.any(Number),
          finalPrice: expect.any(Number),
          id: expect.any(String),
          itemsInOrder: [{ name: "newProduct", quantity: 1 }],
          paidBy: expect.any(String),
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("pay must return an error if order is not found", async () => {
    const id = "a6c02b5-c8df-4405-b607-75a4aa9c557e";
    try {
      await service.pay(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(`Error: Order with id ${id} not found`);
    }
  });
  test("pay must return an error if user is not validated", async () => {
    try {
      await service.pay(order.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        "Error: Before making an order, you need to validate your account!"
      );
    }
  });

  test("pay must return an error if order is already paid", async () => {
    try {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isValidated: true,
        },
      });
      await service.pay(order.id);
      await service.pay(order.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Order already paid!");
    }
  });

  test("pay must fail if wrong values are provided", async () => {
    try {
      await service.pay(555 as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("update must return an object with the updated order", async () => {
    const mockDiscount = 15;
    try {
      const updateOrder = await service.update(order.id, cart.id, mockDiscount);
      expect(updateOrder).toBeTruthy();
      expect(updateOrder).toEqual({
        updatedOrder: {
          cartId: expect.any(String),
          createdAt: expect.any(Date),
          discount: mockDiscount,
          finalPrice: expect.any(Number),
          id: expect.any(String),
          itemsInOrder: [
            {
              name: "newProduct",
              quantity: 1,
            },
          ],
          paidBy: null,
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("update must return an error if cart or order not found", async () => {
    const id = "a6c02b5-c8df-4405-b607-75a4aa9c557e";
    try {
      await service.update(id, cart.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Order or cart not found");
    }
  });

  test("update must return an error if order is already paid", async () => {
    try {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isValidated: true,
        },
      });
      const { paidOrder } = await service.pay(order.id);
      const newCart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
      await service.update(paidOrder.id, newCart.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Order already paid");
    }
  });

  test("update must fail if wrong values are provided", async () => {
    try {
      await service.update(5656 as any, 5665 as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("delete must return a string with order id", async () => {
    try {
      const deleteOrder = await service.delete(order.id);
      expect(deleteOrder).toBeTruthy();
      expect(deleteOrder).toBe(`Order with id ${order.id} was deleted`);
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("delete must return an error if order is not found", async () => {
    const id = "a6c02b5-c8df-4405-b607-75a4aa9c557e";
    try {
      await service.delete(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(`Error: Order with id ${id} not found`);
    }
  });

  test("delete must return an error if order is alreadyPaid", async () => {
    try {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isValidated: true,
        },
      });
      const { paidOrder } = await service.pay(order.id);
      await service.delete(paidOrder.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        "Error: Order already paid, wait until the products arrive to the client and contact the DB Admin to delete the order. We recommend not delete any orders which was completed"
      );
    }
  });

  test("delete must fail if wrong values are provided", async () => {
    try {
      await service.delete(312321 as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain(`Invalid value provided`);
    }
  });
});
