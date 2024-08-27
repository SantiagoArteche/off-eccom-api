import supertest from "supertest";
import { testServer } from "../test-server";
import { prisma } from "../../src/data/postgres/init";

const api = supertest(testServer.app);

describe("tests on /api/products", () => {
  let product: any;
  beforeAll(async () => {
    await testServer.start();
  });

  beforeEach(async () => {
    await prisma.category.create({
      data: {
        name: "newCategory",
      },
    });
    product = await prisma.products.create({
      data: {
        category: "newCategory",
        name: "newProduct",
        lowStock: false,
        price: 1500,
        stock: 20,
      },
    });
  });

  afterEach(async () => {
    await prisma.products.deleteMany();
    await prisma.category.deleteMany();
  });
  afterAll(async () => {
    await testServer.close();
  });

  test("GET /api/products must get all products", async () => {
    const { statusCode, body, ok } = await api.get("/api/products");

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      currentPage: 1,
      limit: 10,
      next: "/api/products?page=2&limit=10",
      prev: null,
      products: expect.any(Array),
      totalProducts: expect.any(Number),
    });
  });

  test("GET /api/products/:id must get a product by id", async () => {
    const { statusCode, body, ok } = await api.get(
      `/api/products/${product.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      product: {
        category: "newCategory",
        createdAt: expect.any(String),
        id: expect.any(String),
        lowStock: false,
        name: "newProduct",
        price: 1500,
        stock: 20,
        updatedAt: expect.any(String),
      },
    });
  });

  test("GET /api/products/:id must fail if product not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { statusCode, text, notFound, ok } = await api.get(
      `/api/products/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toBe(`Product with id ${mockId} not found`);
  });

  test("POST /api/products must create a product", async () => {
    const { body, ok, statusCode } = await api.post("/api/products").send({
      category: "newCategory",
      name: "newProductB",
      lowStock: false,
      price: 1500,
      stock: 20,
    });

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body).toEqual({
      product: {
        category: "newCategory",
        createdAt: expect.any(String),
        id: expect.any(String),
        lowStock: false,
        name: "newProductB",
        price: 1500,
        stock: 20,
        updatedAt: expect.any(String),
      },
    });
  });

  test("POST /api/products must fail if the product already exists", async () => {
    const { ok, statusCode, badRequest, text } = await api
      .post("/api/products")
      .send({
        category: "newCategory",
        name: "newProduct",
        lowStock: false,
        price: 1500,
        stock: 20,
      });

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toEqual("Product with that name already exist");
  });

  test("POST /api/products must fail if a required value is missing", async () => {
    const { ok, statusCode, badRequest, text } = await api
      .post("/api/products")
      .send({
        name: "newProduct",
        lowStock: false,
        price: 1500,
        stock: 20,
      });

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toEqual("Category is required");
  });

  test("POST /api/products must fail if wrong values are provided", async () => {
    const { ok, statusCode, badRequest, text } = await api
      .post("/api/products")
      .send({
        category: "newCategory",
        name: "newProduct",
        lowStock: false,
        price: "wrong price",
        stock: 20,
      });

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toEqual("Price must be a number");
  });

  test("PUT /api/products/:id must update a product", async () => {
    const { ok, body, statusCode } = await api
      .put(`/api/products/${product.id}`)
      .send({
        name: "updatedProduct",
      });

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body).toEqual({
      updatedProduct: {
        category: "newCategory",
        createdAt: expect.any(String),
        id: expect.any(String),
        lowStock: false,
        name: "updatedProduct",
        price: 1500,
        stock: 20,
        updatedAt: expect.any(String),
      },
    });
  });

  test("PUT /api/products/:id must fail if product not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { ok, text, statusCode, notFound } = await api
      .put(`/api/products/${mockId}`)
      .send({
        name: "updatedProduct",
      });

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toBe(`Product with id ${mockId} not found`);
  });

  test("PUT /api/products/:id must fail if wrong values are provided", async () => {
    const { ok, text, statusCode, badRequest } = await api
      .put(`/api/products/${product.id}`)
      .send({
        name: 3443,
      });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(text).toBe("Name must be a string");
  });

  test("DELETE /api/products/:id must delete a product", async () => {
    const { ok, text, statusCode } = await api.delete(
      `/api/products/${product.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toBe(`Product with id ${product.id} was deleted`);
  });

  test("DELETE /api/products/:id must fail if product not found ", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { ok, text, statusCode, notFound } = await api.delete(
      `/api/products/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toBe("Product not found");
  });
});
