import supertest from "supertest";
import { testServer } from "../test-server";
import { prisma } from "../../src/data/postgres/init";

const api = supertest(testServer.app);
describe("tests on /api/cart", () => {
  beforeAll(async () => {
    await testServer.start();
  });
  afterAll(async () => {
    await testServer.close();
  });

  let cart: any;
  let user: any;
  let product: any;
  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        age: 25,
        email: "test@arteche.com",
        firstName: "Santiago",
        lastName: "Arteche",
        password: "123456",
      },
    });

    [cart, , product] = await Promise.all([
      await prisma.cart.create({
        data: {
          userId: user.id,
        },
      }),
      await prisma.category.create({
        data: {
          name: "newCategory",
        },
      }),
      await prisma.products.create({
        data: {
          category: "newCategory",
          price: 1500,
          stock: 100,
          name: "newProduct",
          lowStock: false,
        },
      }),
    ]);
  });
  afterEach(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.products.deleteMany();
    await prisma.category.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.user.deleteMany();
  });

  test("GET /api/cart must return all carts", async () => {
    const { statusCode, body, ok } = await api.get("/api/cart");

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      allCarts: expect.any(Array),
      currentPage: 1,
      limit: 10,
      next: "/api/cart?page=2&limit=10",
      prev: null,
      totalCarts: expect.any(Number),
    });
  });

  test("GET /api/cart pagination must work", async () => {
    const mockPagination = { limit: 5, page: 2 };
    const { statusCode, body, ok } = await api.get(
      `/api/cart?limit=${mockPagination.limit}&page=${mockPagination.page}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      allCarts: expect.any(Array),
      currentPage: mockPagination.page,
      limit: mockPagination.limit,
      next: `/api/cart?page=${mockPagination.page + 1}&limit=${
        mockPagination.limit
      }`,
      prev: `/api/cart?page=${mockPagination.page + -1}&limit=${
        mockPagination.limit
      }`,
      totalCarts: expect.any(Number),
    });
  });

  test("GET /api/cart/:id must return the cart by id", async () => {
    const { statusCode, body, ok } = await api.get(`/api/cart/${cart.id}`);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      cart: {
        cartItemId: expect.any(Array),
        id: expect.any(String),
        placeOrder: false,
        subtotal: 0,
        tax: 0,
        total: 0,
        userId: expect.any(String),
      },
    });
  });

  test("GET /api/cart/:id must fail if cart not found", async () => {
    const mockId = "a25e3c9e-f145-499d-a78c-4ae7dedd4f90";
    const { statusCode, text, ok, notFound } = await api.get(
      `/api/cart/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain("Cart not found");
  });

  test("DELETE /api/cart/:id must delete a cart", async () => {
    const { statusCode, text, ok } = await api.delete(`/api/cart/${cart.id}`);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(`Cart with id ${cart.id} was deleted`);
  });

  test("DELETE /api/cart/:id must fail if cart not found", async () => {
    const mockId = "a25e3c9e-f145-499d-a78c-4ae7dedd4f90";
    const { statusCode, text, ok, notFound } = await api.delete(
      `/api/cart/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain("Cart not found");
  });

  test("POST /api/cart/:userId must create a cart", async () => {
    await api.delete(`/api/cart/${cart.id}`);

    const { statusCode, body, ok } = await api.post(`/api/cart/${user.id}`);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body).toEqual({
      cart: {
        cartItemId: [],
        id: expect.any(String),
        placeOrder: false,
        subtotal: 0,
        tax: 0,
        total: 0,
        userId: expect.any(String),
      },
      msg: "Cart created!",
    });
  });

  test("POST /api/cart/:userId must fail if user not exists", async () => {
    const mockId = "a25e3c9e-f145-499d-a78c-4ae7dedd4f90";
    const { statusCode, text, ok, notFound } = await api.post(
      `/api/cart/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain(
      `User with id ${mockId} not found, to create a cart you need an user`
    );
  });

  test("POST /api/cart/:userId must fail if user already have a cart", async () => {
    const { statusCode, text, ok, badRequest } = await api.post(
      `/api/cart/${user.id}`
    );

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain("An user can create only one cart");
  });

  test("PUT /api/cart/:productId/:cartId must add a product to cart", async () => {
    const { statusCode, body, ok } = await api.put(
      `/api/cart/${product.id}/${cart.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      msg: "Cart Updated",
      updatedCart: {
        cartItemId: expect.any(Array),
        id: expect.any(String),
        placeOrder: false,
        subtotal: expect.any(Number),
        tax: expect.any(Number),
        total: expect.any(Number),
        userId: expect.any(String),
      },
    });
  });

  test("PUT /api/cart/:productId/:cartId must fail if product or cart not found", async () => {
    const mockId = "a25e3c9e-f145-499d-a78c-4ae7dedd4f90";
    const { text, statusCode, notFound, ok } = await api.put(
      `/api/cart/${mockId}/${cart.id}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain("Product or cart not found");
  });

  test("PUT /api/cart/:productId/:cartId must fail if product is out of stock", async () => {
    await prisma.products.update({
      where: {
        id: product.id,
      },
      data: {
        stock: 0,
      },
    });
    const { text, statusCode, badRequest, ok } = await api.put(
      `/api/cart/${product.id}/${cart.id}`
    );

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain("Product out of stock");
  });

  test("PUT /api/cart/:productId/:cartId must fail if product is the quantity in the body is greater than the stock", async () => {
    const { text, statusCode, badRequest, ok } = await api
      .put(`/api/cart/${product.id}/${cart.id}`)
      .send({
        quantity: 1000,
      });

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain(
      `We only have ${product.stock} units of newProduct, change your quantity!`
    );
  });

  test("DELETE /api/cart/:productId/:cartId must decrement by one the quantity of the product", async () => {
    await api.put(`/api/cart/${product.id}/${cart.id}`);
    const { text, statusCode, ok } = await api.delete(
      `/api/cart/${product.id}/${cart.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(
      `Quantity on product ${product.id} from cart ${cart.id} was updated`
    );
  });

  test("DELETE /api/cart/:productId/:cartId must fail if product or cart not found ", async () => {
    const mockId = "a25e3c9e-f145-499d-a78c-4ae7dedd4f90";
    const { text, statusCode, ok, notFound } = await api.delete(
      `/api/cart/${product.id}/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain("Product or cart not found");
  });

  test("DELETE /api/cart/:productId/:cartId must fail if product not found in cart", async () => {
    const { text, statusCode, ok, notFound } = await api.delete(
      `/api/cart/${product.id}/${cart.id}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain("Product in cart not found");
  });

  test("DELETE /api/cart/removeproduct/:productId/:cartId must remove all the units of the product from the cart", async () => {
    await api.put(`/api/cart/${product.id}/${cart.id}`);
    await api.put(`/api/cart/${product.id}/${cart.id}`);
    const { text, statusCode, ok } = await api.delete(
      `/api/cart/removeproduct/${product.id}/${cart.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(
      `Product ${product.id} from cart ${cart.id} was deleted`
    );
  });

  test("DELETE /api/cart/removeproduct/:productId/:cartId must fail if product or cart not found", async () => {
    const { text, statusCode, ok, notFound } = await api.delete(
      `/api/cart/removeproduct/${product.id}/${cart.id}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain("Product in cart not found");
  });

  test("DELETE /api/cart/removeproduct/:productId/:cartId must fail if product not found in cart", async () => {
    const mockId = "a25e3c9e-f145-499d-a78c-4ae7dedd4f90";
    const { text, statusCode, ok, notFound } = await api.delete(
      `/api/cart/removeproduct/${product.id}/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain("Product or cart not found");
  });
});
