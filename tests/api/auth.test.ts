import supertest from "supertest";
import { testServer } from "../test-server";
import { prisma } from "../../src/data/postgres/init";
import { Bcrypt, Jwt } from "../../src/config";

const api = supertest(testServer.app);

describe("test on /api/auth", () => {
  beforeAll(async () => {
    await testServer.start();
  });
  let user: any;
  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        firstName: "Santiago",
        lastName: "Arteche",
        email: "san@test.com",
        age: 25,
        password: Bcrypt.hashPassword("123456"),
        isValidated: true,
      },
    });
  });
  afterEach(async () => {
    await prisma.user.deleteMany();
  });
  afterAll(async () => {
    await testServer.close();
  });

  test("GET /api/auth/login must validate the login", async () => {
    const { body: loginBody } = await api.post("/api/auth/login").send({
      email: user.email,
      password: "123456",
    });

    const token = loginBody.token;

    const { statusCode, ok, text } = await api
      .get("/api/auth/login")
      .set("Cookie", `access_token=${token}`);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(`User with email ${user.email} logged`);
  });

  test("GET /api/auth/login must fail if cookie not found", async () => {
    const { statusCode, ok, text, notFound } = await api.get("/api/auth/login");

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain("Cookie not found");
  });

  test("GET /api/auth/login must fail if user is not validated", async () => {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isValidated: false,
      },
    });

    const { body: loginBody } = await api.post("/api/auth/login").send({
      email: user.email,
      password: "123456",
    });

    const token = loginBody.token;

    const { statusCode, ok, text, unauthorized } = await api
      .get("/api/auth/login")
      .set("Cookie", `access_token=${token}`);

    expect(ok).toBeFalsy();
    expect(unauthorized).toBeTruthy();
    expect(statusCode).toBe(401);
    expect(text).toContain("User not validated");
  });

  test("GET /api/auth/login must fail if user is not found", async () => {
    const { body: loginBody } = await api.post("/api/auth/login").send({
      email: user.email,
      password: "123456",
    });

    const token = loginBody.token;
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    const { statusCode, ok, text, notFound } = await api
      .get("/api/auth/login")
      .set("Cookie", `access_token=${token}`);

    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain("User not exists");
  });

  test("POST /api/auth/login must login an user", async () => {
    const { body, ok, statusCode } = await api.post("/api/auth/login").send({
      email: user.email,
      password: "123456",
    });

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      token: expect.any(String),
      user: {
        age: 25,
        email: "san@test.com",
        firstName: "Santiago",
        id: expect.any(String),
        isValidated: expect.any(Boolean),
        lastName: "Arteche",
      },
    });
  });

  test("POST /api/auth/login must fail if user not found", async () => {
    const mockEmail = "notfound@test.com";
    const { text, ok, statusCode, notFound } = await api
      .post("/api/auth/login")
      .send({
        email: mockEmail,
        password: "123456",
      });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
    expect(text).toContain("Wrong credentials");
  });

  test("POST /api/auth/login must fail if email or password are missing", async () => {
    const { text, ok, statusCode } = await api.post("/api/auth/login").send({
      email: user.email,
    });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(text).toContain("Email and password are required");
  });

  test("POST /api/auth/login must fail if wrong values are provided", async () => {
    const { text, ok, statusCode } = await api.post("/api/auth/login").send({
      email: 8989,
      password: [],
    });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(500);
    expect(text).toContain("Internal server error");
  });

  test("GET /api/auth/validate/:token must validate a new user with a valid email", async () => {
    const newUser = await prisma.user.create({
      data: {
        firstName: "Santiago",
        lastName: "Arteche",
        email: "test@test.com",
        age: 25,
        password: Bcrypt.hashPassword("123456"),
        isValidated: false,
      },
    });

    const token = await Jwt.createToken(
      { email: newUser.email, id: newUser.id },
      "3h"
    );

    const { ok, text, statusCode } = await api.get(
      `/api/auth/validate/${token}`
    );

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(text).toContain(`User with email ${newUser.email} validated`);
  });

  test("GET /api/auth/validate/:token must fail if token is invalid", async () => {
    const { ok, text, statusCode, serverError } = await api.get(
      `/api/auth/validate/bbb`
    );

    expect(ok).toBeFalsy();
    expect(serverError).toBeTruthy();
    expect(statusCode).toBe(500);
    expect(text).toContain("JsonWebTokenError: jwt malformed");
  });

  test("GET /api/auth/validate/:token must fail if user is already validated", async () => {
    const token = await Jwt.createToken(
      { email: user.email, id: user.id },
      "3h"
    );

    const { ok, text, statusCode, badRequest } = await api.get(
      `/api/auth/validate/${token}`
    );
    expect(ok).toBeFalsy();
    expect(badRequest).toBeTruthy();
    expect(statusCode).toBe(400);
    expect(text).toContain("User already validated");
  });

  test("GET /api/auth/validate/:token must fail if user not found", async () => {
    const token = await Jwt.createToken(
      { email: user.email, id: user.id },
      "3h"
    );

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    const { ok, text, statusCode, notFound } = await api.get(
      `/api/auth/validate/${token}`
    );
    expect(ok).toBeFalsy();
    expect(notFound).toBeTruthy();
    expect(statusCode).toBe(404);
    expect(text).toContain("User not exists");
  });
});
