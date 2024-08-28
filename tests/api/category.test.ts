import supertest from "supertest";
import { testServer } from "../test-server";
import { prisma } from "../../src/data/postgres/init";

const api = supertest(testServer.app);

describe("tests on /api/categories", () => {
  let category: any;
  beforeAll(async () => {
    await testServer.start();
  });

  beforeEach(async () => {
    category = await prisma.category.create({
      data: {
        name: "newCategory",
      },
    });
  });

  afterEach(async () => {
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    await testServer.close();
  });

  test("GET /api/categories must return all categories", async () => {
    const { statusCode, body, ok } = await api.get("/api/categories");

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      categories: expect.any(Array),
      currentPage: 1,
      limit: 10,
      next: "/api/categories?page=2&limit=10",
      prev: null,
      totalCategories: expect.any(Number),
    });
  });

  test("GET /api/categories pagination must work", async () => {
    const mockPagination = { limit: 5, page: 2 };
    const { body, ok, statusCode } = await api.get(
      `/api/categories?limit=${mockPagination.limit}&page=${mockPagination.page}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      currentPage: mockPagination.page,
      limit: mockPagination.limit,
      next: `/api/categories?page=${mockPagination.page + 1}&limit=${
        mockPagination.limit
      }`,
      categories: expect.any(Array),
      prev: `/api/categories?page=${mockPagination.page - 1}&limit=${
        mockPagination.limit
      }`,
      totalCategories: expect.any(Number),
    });
  });

  test("GET /api/categories/:id must return the category found", async () => {
    const { statusCode, body, ok } = await api.get(
      `/api/categories/${category.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      category: {
        createdAt: expect.any(String),
        id: expect.any(String),
        name: "newCategory",
        updatedAt: expect.any(String),
      },
    });
  });

  test("GET /api/categories/:id must fail if category not found", async () => {
    const mockId = "d60177f4-94a3-426d-87fb-1f9f69dc74c6";
    const { statusCode, text, ok, notFound } = await api.get(
      `/api/categories/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain(`Category with id ${mockId} not found`);
  });
  test("POST /api/categories must create a new category", async () => {
    const { statusCode, body, ok } = await api.post(`/api/categories`).send({
      name: "newCategoryB",
    });

    expect(ok).toBeTruthy();

    expect(statusCode).toBe(201);
    expect(body).toEqual({
      category: {
        createdAt: expect.any(String),
        id: expect.any(String),
        name: "newCategoryB",
        updatedAt: expect.any(String),
      },
    });
  });

  test("POST /api/categories must fail if category already exists", async () => {
    const { statusCode, text, ok, badRequest } = await api
      .post(`/api/categories`)
      .send({
        name: "newCategory",
      });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(text).toContain("Category already exist");
  });

  test("POST /api/categories must fail if wrong values are provided", async () => {
    const { statusCode, text, ok, badRequest } = await api
      .post(`/api/categories`)
      .send({
        name: 55,
      });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(text).toContain("Name must be a string");
  });

  test("PUT /api/categories/:id must update a category", async () => {
    const { statusCode, body, ok } = await api
      .put(`/api/categories/${category.id}`)
      .send({
        name: "updatedCategory",
      });

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body).toEqual({
      updatedCategory: {
        createdAt: expect.any(String),
        id: expect.any(String),
        name: "updatedCategory",
        updatedAt: expect.any(String),
      },
    });
  });

  test("PUT /api/categories/:id must fail if category not found", async () => {
    const mockId = "d60177f4-94a3-426d-87fb-1f9f69dc74c6";
    const { statusCode, text, ok, notFound } = await api
      .put(`/api/categories/${mockId}`)
      .send({
        name: "updatedCategory",
      });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain(`Category with id ${mockId} not found`);
  });

  test("PUT /api/categories/:id must fail if wrong values are provided", async () => {
    const { statusCode, text, ok, badRequest } = await api
      .put(`/api/categories/${category.id}`)
      .send({
        name: 55,
      });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
    expect(text).toContain("Name must be a string");
  });

  test("DELETE /api/categories/:id must delete a category", async () => {
    const { statusCode, text, ok } = await api.delete(
      `/api/categories/${category.id}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(`Category with id ${category.id} was deleted`);
  });

  test("DELETE /api/categories/:id must fail if category not found", async () => {
    const mockId = "d60177f4-94a3-426d-87fb-1f9f69dc74c6";
    const { statusCode, text, ok, notFound } = await api.delete(
      `/api/categories/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain("Category not found");
  });
});
