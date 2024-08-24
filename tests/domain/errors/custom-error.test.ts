import { Response } from "express";
import { CustomError } from "../../../src/domain/errors/custom-errors";

describe("tests on custom-errors.ts", () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as any as Response;

  test("must create an instance of a custom error", () => {
    const newCustomError = new CustomError(400, "test custom error");
    expect(newCustomError).toBeInstanceOf(Error);
    expect(newCustomError).toBeInstanceOf(CustomError);
    expect(newCustomError).toHaveProperty("statusCode");
    expect(newCustomError).toHaveProperty("message");
  });

  test("must create an internal server error", () => {
    const internalServerError = CustomError.internalServer("Internal server");

    expect(internalServerError.message).toBe("Internal server");
    expect(internalServerError.statusCode).toBe(500);
    expect(internalServerError).toBeInstanceOf(Error);
  });

  test("must create a bad request error", () => {
    const badRequestError = CustomError.badRequest("Bad request");

    expect(badRequestError.message).toBe("Bad request");
    expect(badRequestError.statusCode).toBe(400);
    expect(badRequestError).toBeInstanceOf(Error);
  });

  test("must create a forbidden error", () => {
    const forbiddenError = CustomError.forbidden("Forbidden");

    expect(forbiddenError.message).toBe("Forbidden");
    expect(forbiddenError.statusCode).toBe(403);
    expect(forbiddenError).toBeInstanceOf(Error);
  });

  test("must create an unauthorized error", () => {
    const unauthorizedError = CustomError.unauthorized("Unauthorized");

    expect(unauthorizedError.message).toBe("Unauthorized");
    expect(unauthorizedError.statusCode).toBe(401);
    expect(unauthorizedError).toBeInstanceOf(Error);
  });

  test("must create an not found error", () => {
    const notFound = CustomError.notFound("Not found");

    expect(notFound.message).toBe("Not found");
    expect(notFound.statusCode).toBe(404);
    expect(notFound).toBeInstanceOf(Error);
  });

  test("should handle custom-errors and send the correct response", () => {
    const notFoundError = new CustomError(404, "Resource not found");

    CustomError.handleErrors(notFoundError, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("Resource not found");
  });

  test("should handle non-custom-errors as internal server errors", () => {
    const genericError = new Error("Something went wrong");

    CustomError.handleErrors(genericError, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal server error");
  });
});
