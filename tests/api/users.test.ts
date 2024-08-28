import supertest from "supertest";
import { testServer } from "../test-server";
import { prisma } from "../../src/data/postgres/init";

const api = supertest(testServer.app);

describe("tests on /api/users", () => {
  let user: any;
  beforeAll(async () => {
    await testServer.start();
  });

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        age: 20,
        email: "arteche@hotmail.com",
        firstName: "Santiago",
        lastName: "Arteche",
        password: `123456`,
      },
    });
  });
  afterEach(async () => {
    await prisma.user.deleteMany();
  });
  afterAll(async () => {
    await testServer.close();
  });

  test("GET /api/users must get all the users", async () => {
    const { statusCode, body, ok } = await api.get("/api/users");

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      currentPage: expect.any(Number),
      limit: expect.any(Number),
      next: "/api/users?page=2&limit=10",
      prev: null,
      totalUsers: expect.any(Number),
      users: expect.any(Array),
    });
  });

  test("GET /api/users pagination must work", async () => {
    const mockPagination = { limit: 5, page: 2 };
    const { body, ok, statusCode } = await api.get(
      `/api/users?limit=${mockPagination.limit}&page=${mockPagination.page}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      currentPage: mockPagination.page,
      limit: mockPagination.limit,
      next: `/api/users?page=${mockPagination.page + 1}&limit=${
        mockPagination.limit
      }`,
      users: expect.any(Array),
      prev: `/api/users?page=${mockPagination.page - 1}&limit=${
        mockPagination.limit
      }`,
      totalUsers: expect.any(Number),
    });
  });

  test("GET /api/users/:id must get an user by id", async () => {
    const { ok, statusCode, body } = await api.get(`/api/users/${user.id}`);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      user: {
        age: 20,
        email: "arteche@hotmail.com",
        firstName: "Santiago",
        id: expect.any(String),
        isValidated: expect.any(Boolean),
        lastName: "Arteche",
        role: "user",
      },
    });
  });

  test("GET /api/users/:id must fail if user not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { ok, statusCode, text, notFound } = await api.get(
      `/api/users/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain(`User with id ${mockId} not found`);
  });

  test("POST /api/users must create an user", async () => {
    const { statusCode, ok, body } = await api.post("/api/users").send({
      age: 20,
      email: "santiartecheb@hotmail.com",
      firstName: "Santiago",
      isValidated: false,
      lastName: "Arteche",
      password: 123456,
    });

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body).toEqual({
      msg: "User Created",
      user: {
        age: 20,
        email: "santiartecheb@hotmail.com",
        firstName: "Santiago",
        id: expect.any(String),
        isValidated: expect.any(Boolean),
        lastName: "Arteche",
        role: "user",
      },
    });
  });

  test("POST /api/users must fail if email is already in use", async () => {
    const { statusCode, ok, text, badRequest } = await api
      .post("/api/users")
      .send({
        age: 20,
        email: "arteche@hotmail.com",
        firstName: "Santiago",
        isValidated: false,
        lastName: "Arteche",
        password: 123456,
      });

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain("Email already in use");
  });

  test("POST /api/users must fail if wrong values are provided to body", async () => {
    const { statusCode, ok, text, badRequest } = await api
      .post("/api/users")
      .send({
        age: "wrongAge",
        email: "arteche@hotmail.com",
        firstName: "Santiago",
        isValidated: false,
        lastName: "Arteche",
        password: 123456,
      });

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain("Age must be a number");
  });

  test("POST /api/users must fail if a required value is missing", async () => {
    const { statusCode, ok, text, badRequest } = await api
      .post("/api/users")
      .send({
        email: "arteche@hotmail.com",
        firstName: "Santiago",
        isValidated: false,
        lastName: "Arteche",
        password: 123456,
      });

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain("Age is required");
  });

  test("POST /api/users/:id must re-send validation email ", async () => {
    const { ok, statusCode, text } = await api
      .post(`/api/users/${user.id}`)
      .send();

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(`Email resend to ${user.email}`);
  });

  test("POST /api/users/:id must fail if user not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { ok, statusCode, text, notFound } = await api
      .post(`/api/users/${mockId}`)
      .send();

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain(`User with id ${mockId} not found`);
  });

  test("POST /api/users/:id must fail if user is already validated", async () => {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isValidated: true,
      },
    });
    const { ok, statusCode, text, badRequest } = await api
      .post(`/api/users/${user.id}`)
      .send();

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain("User already validated");
  });

  test("PUT /api/users/:id must update an user", async () => {
    const { statusCode, ok, body } = await api
      .put(`/api/users/${user.id}`)
      .send({
        firstName: "update user name",
      });

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body).toEqual({
      msg: "User Updated",
      user: {
        age: 20,
        email: "arteche@hotmail.com",
        firstName: "update user name",
        id: user.id,
        isValidated: false,
        lastName: "Arteche",
      },
    });
  });

  test("PUT /api/users/:id must fail if user not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { statusCode, ok, text, notFound } = await api
      .put(`/api/users/${mockId}`)
      .send({
        firstName: "update user name",
      });

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain(`User with id ${mockId} not found`);
  });

  test("PUT /api/users/:id must fail if wrong values are provided to body", async () => {
    const { statusCode, ok, text, badRequest } = await api
      .put(`/api/users/${user.id}`)
      .send({
        firstName: 55,
      });

    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain("Firstname must be a string");
  });

  test("DELETE /api/users/:id must delete an user", async () => {
    const { statusCode, ok, text } = await api.delete(`/api/users/${user.id}`);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(`User with id ${user.id} was deleted`);
  });

  test("DELETE /api/users/:id must fail if user not found", async () => {
    const mockId = "0e7850d5-b6e6-422f-a7d4-5ab8xa13e833";
    const { statusCode, ok, text, notFound } = await api.delete(
      `/api/users/${mockId}`
    );

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain(`User with id ${mockId} not found`);
  });
});
