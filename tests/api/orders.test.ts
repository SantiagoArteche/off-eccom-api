import supertest from "supertest";
import { testServer } from "../test-server";
import { prisma } from "../../src/data/postgres/init";

const api = supertest(testServer.app);
describe("tests on /api/orders", () => {
  beforeAll(async () => {
    testServer.start();
  });

  let user: any;
  let cart: any;
  let order: any;
  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        lastName: "test",
        age: 22,
        firstName: "test",
        email: "test@hotmail.com",
        password: "123456",
        isValidated: true,
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
  });

  afterEach(async () => {
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.order.deleteMany({});
  });

  afterAll(async () => {
    testServer.close();
  });

  test("GET /api/orders must return all orders", async () => {
    const { body, ok, statusCode } = await api.get("/api/orders");

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      currentPage: 1,
      limit: 10,
      next: "/api/orders?page=2&limit=10",
      orders: expect.any(Array),
      prev: null,
      totalOrders: expect.any(Number),
    });
  });

  test("GET /api/orders pagination must work", async () => {
    const mockPagination = { limit: 5, page: 2 };
    const { body, ok, statusCode } = await api.get(
      `/api/orders?limit=${mockPagination.limit}&page=${mockPagination.page}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      currentPage: mockPagination.page,
      limit: mockPagination.limit,
      next: `/api/orders?page=${mockPagination.page + 1}&limit=${
        mockPagination.limit
      }`,
      orders: expect.any(Array),
      prev: `/api/orders?page=${mockPagination.page - 1}&limit=${
        mockPagination.limit
      }`,
      totalOrders: expect.any(Number),
    });
  });

  test("GET /api/orders/:id must return the order by id", async () => {
    const { statusCode, body, ok } = await api.get(`/api/orders/${order.id}`);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      order: {
        cartId: expect.any(String),
        createdAt: expect.any(String),
        discount: expect.any(Number),
        finalPrice: expect.any(Number),
        id: expect.any(String),
        itemsInOrder: [{ name: "newProduct", quantity: expect.any(Number) }],
        paidBy: null,
      },
    });
  });

  test("GET /api/orders/:id must fail if order not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { statusCode, notFound, text, ok } = await api.get(
      `/api/orders/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain(`Order with id ${mockId} not found`);
  });

  test("DELETE /api/orders/:id must delete an order", async () => {
    const { statusCode, text, ok } = await api.delete(
      `/api/orders/${order.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(`Order with id ${order.id} was deleted`);
  });

  test("DELETE /api/orders/:id must fail if order is already paid", async () => {
    await api.post(`/api/orders/pay/${order.id}`);
    const { statusCode, text, ok, badRequest } = await api.delete(
      `/api/orders/${order.id}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(text).toContain(
      "Order already paid, wait until the products arrive to the client and contact the DB Admin to delete the order. We recommend not delete any orders which was completed"
    );
  });

  test("DELETE /api/orders/:id must fail if order not found ", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { statusCode, text, ok, notFound } = await api.delete(
      `/api/orders/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain(`Order with id ${mockId} not found`);
  });

  test("POST /api/orders/:cartId must create an order", async () => {
    await prisma.order.delete({
      where: {
        id: order.id,
      },
    });

    const { body, statusCode, ok } = await api.post(`/api/orders/${cart.id}`);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201),
      expect(body).toEqual({
        order: {
          cartId: expect.any(String),
          createdAt: expect.any(String),
          discount: expect.any(Number),
          finalPrice: expect.any(Number),
          id: expect.any(String),
          itemsInOrder: [{ name: "newProduct", quantity: expect.any(Number) }],
          paidBy: null,
        },
        userId: expect.any(String),
      });
  });

  test("POST /api/orders/:cartId must fail if discount isNaN", async () => {
    await prisma.order.delete({
      where: {
        id: order.id,
      },
    });

    const { text, statusCode, ok, badRequest } = await api
      .post(`/api/orders/${cart.id}`)
      .send({
        discount: "notANumber",
      });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(text).toContain("Discount must be a number");
  });

  test("POST /api/orders/:cartId must fail if cart not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { text, statusCode, ok, notFound } = await api.post(
      `/api/orders/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain("Cart not found");
  });

  test("POST /api/orders/:cartId must fail if user already have an order", async () => {
    const { text, statusCode, ok, badRequest } = await api.post(
      `/api/orders/${cart.id}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400), expect(badRequest).toBeTruthy();
    expect(text).toContain("You only can make one order at time");
  });

  test("POST /api/orders/:cartId must fail if the cart used in the order not have any items", async () => {
    await Promise.all([
      prisma.order.delete({
        where: {
          id: order.id,
        },
      }),
      prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          total: 0,
        },
      }),
    ]);

    const { text, statusCode, ok, badRequest } = await api.post(
      `/api/orders/${cart.id}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400), expect(badRequest).toBeTruthy();
    expect(text).toContain(
      "Insert products to your cart before make an order!"
    );
  });

  test("POST /api/orders/pay/:id must paid the order", async () => {
    const { body, statusCode, ok } = await api.post(
      `/api/orders/pay/${order.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      msg: `Order with id ${order.id} was paid!`,
      paidOrder: {
        cartId: null,
        createdAt: expect.any(String),
        discount: 0,
        finalPrice: expect.any(Number),
        id: expect.any(String),
        itemsInOrder: [{ name: "newProduct", quantity: expect.any(Number) }],
        paidBy: expect.any(String),
      },
    });
  });
  test("POST /api/orders/pay/:id must fail if order not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { statusCode, ok, notFound, text } = await api.post(
      `/api/orders/pay/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain(`Order with id ${mockId} not found`);
  });

  test("POST /api/orders/pay/:id must fail if order is already paid", async () => {
    await api.post(`/api/orders/pay/${order.id}`);
    const { statusCode, ok, serverError, text } = await api.post(
      `/api/orders/pay/${order.id}`
    );

    expect(ok).toBeFalsy();
    expect(serverError).toBeTruthy();
    expect(statusCode).toBe(500);
    expect(text).toContain("Order already paid!");
  });

  test("POST /api/orders/pay/:id must fail if user is not validated", async () => {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isValidated: false,
      },
    });
    const { statusCode, ok, forbidden, text } = await api.post(
      `/api/orders/pay/${order.id}`
    );

    expect(ok).toBeFalsy();
    expect(forbidden).toBeTruthy();
    expect(statusCode).toBe(403);
    expect(text).toContain(
      "Before making an order, you need to validate your account!"
    );
  });

  test("PUT /api/orders/:orderId/:cartId must update the order", async () => {
    const mockBody = { discount: 10 };
    const { statusCode, ok, body } = await api
      .put(`/api/orders/${order.id}/${cart.id}`)
      .send(mockBody);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      updatedOrder: {
        cartId: expect.any(String),
        createdAt: expect.any(String),
        discount: mockBody.discount,
        finalPrice: expect.any(Number),
        id: expect.any(String),
        itemsInOrder: [{ name: "newProduct", quantity: expect.any(Number) }],
        paidBy: null,
      },
    });
  });

  test("PUT /api/orders/:orderId/:cartId must fail if order not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { statusCode, ok, text, notFound } = await api.put(
      `/api/orders/${mockId}/${cart.id}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain("Order or cart not found");
  });

  test("PUT /api/orders/:orderId/:cartId must fail if order is already paid", async () => {
    //The cart is deleted when the order is paid thats why I update the order instead of
    //use api.post('/api/orders/pay/${order.id}')
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        cartId: null,
      },
    });

    const { statusCode, ok, text, badRequest } = await api.put(
      `/api/orders/${order.id}/${cart.id}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(text).toContain("Order already paid");
  });
});
