import { AuthController } from "../../../src/presentation/auth/controller";
import { CustomError } from "../../../src/domain/errors/custom-errors";
import { Request } from "express";

describe("test on auth/controller.ts", () => {
  let authServiceMock: any;
  let mockResponse: any;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn(),
      validateLogin: jest.fn(),
      validate: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("must create an instance of auth controller", () => {
    const controller = new AuthController(authServiceMock);

    expect(controller).toBeInstanceOf(AuthController);
    expect(controller).toHaveProperty("loginUser");
    expect(controller).toHaveProperty("validateUser");
    expect(controller).toHaveProperty("validateLogin");
    expect(typeof controller.loginUser).toBe("function");
    expect(typeof controller.validateLogin).toBe("function");
    expect(typeof controller.validateUser).toBe("function");
  });

  test("loginUser should return an object with token and user", async () => {
    const mockUser = {
      email: "test@example.com",
      password: "123456",
    };
    const mockRequest = {
      body: mockUser,
    };

    const controller = new AuthController(authServiceMock);

    authServiceMock.login.mockResolvedValue({ mockRequest, token: "newToken" });
    await controller.loginUser(mockRequest as any, mockResponse);

    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(authServiceMock.login).toHaveBeenCalledWith(
      mockUser.email,
      mockUser.password
    );

    expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      "access_token",
      "newToken",
      {
        httpOnly: true,
        maxAge: 1000 * 60 * 120,
        sameSite: "strict",
      }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith({
      mockRequest,
      token: "newToken",
    });
  });

  test("loginUser should return 400 if email or password is missing", async () => {
    const mockRequest = { body: { email: "test@example.com" } }; // Missing password
    const controller = new AuthController(authServiceMock);

    await controller.loginUser(mockRequest as any, mockResponse);

    expect(authServiceMock.login).not.toHaveBeenCalled(); // Service should not be called
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Email and password are required"
    );
  });

  test("loginUser should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      body: { email: "test@example.com", password: "123456" },
    };
    const mockError = new Error("Login failed");

    const controller = new AuthController(authServiceMock);

    authServiceMock.login.mockRejectedValue(mockError);
    await controller.loginUser(mockRequest as Request, mockResponse);

    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("validateUser should return a string with the user validated", async () => {
    const mockRequest = {
      params: {
        token: {
          id: "123213",
          email: "santi123@hotmail.com",
        },
      },
    };

    const respMessage = `User with email ${mockRequest.params.token.email} validated`;
    const controller = new AuthController(authServiceMock);

    authServiceMock.validate.mockResolvedValue(respMessage);
    await controller.validateUser(mockRequest as any, mockResponse);

    expect(authServiceMock.validate).toHaveBeenCalledTimes(1);
    expect(authServiceMock.validate).toHaveBeenCalledWith(
      mockRequest.params.token
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(respMessage);
  });

  test("validateUser should return a 404 if token is missing", async () => {
    const mockRequest = {
      params: {},
    };

    const controller = new AuthController(authServiceMock);

    await controller.validateUser(mockRequest as any, mockResponse);

    expect(authServiceMock.validate).not.toHaveBeenCalled(); // Service should not be called
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.send).toHaveBeenCalledWith("Token not found");
  });

  test("validateUser should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: {
        token: {
          id: 3,
          email: "santiarteche@hotmail.com",
        },
      },
    };
    const mockError = new Error("Error in validation");

    authServiceMock.validate.mockRejectedValue(mockError);
    const controller = new AuthController(authServiceMock);
    await controller.validateUser(mockRequest as any, mockResponse);

    expect(authServiceMock.validate).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("validateLogin should return a string with the user logged", async () => {
    const mockRequest = {
      headers: {
        cookie: {
          email: "sanarteche@hotmail.com",
          id: 123123,
        },
      },
    };

    const respMessage = `User with email ${mockRequest.headers.cookie.email} validated`;

    authServiceMock.validateLogin.mockResolvedValue(respMessage);
    const controller = new AuthController(authServiceMock);
    await controller.validateLogin(mockRequest as any, mockResponse);

    expect(authServiceMock.validateLogin).toHaveBeenCalledTimes(1);
    expect(authServiceMock.validateLogin).toHaveBeenCalledWith(
      mockRequest.headers.cookie
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(respMessage);
  });

  test("validateLogin should return 404 if cookie is missing", async () => {
    const mockRequest = {
      headers: {},
    };

    const controller = new AuthController(authServiceMock);

    await controller.validateLogin(mockRequest as any, mockResponse);

    expect(authServiceMock.validateLogin).not.toHaveBeenCalled(); // Service should not be called
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.send).toHaveBeenCalledWith("Cookie not found");
  });

  test("validateLogin should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      headers: {
        cookie: {
          id: 3,
          email: "santiarteche@hotmail.com",
        },
      },
    };
    const mockError = new Error("Error in validation");

    authServiceMock.validateLogin.mockRejectedValue(mockError);
    const controller = new AuthController(authServiceMock);
    await controller.validateLogin(mockRequest as any, mockResponse);

    expect(authServiceMock.validateLogin).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
});
