import { CustomError } from "../../../../src/domain/errors/custom-errors";
import { Request } from "express";
import { AuthController } from "../../../../src/presentation/auth/controller";

describe("test on auth/controller.ts", () => {
  let authServiceMock: any;
  let mockResponse: any;
  let controller: AuthController;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn(),
      validateLogin: jest.fn(),
      validate: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    controller = new AuthController(authServiceMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("must create an instance of auth controller", () => {
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
    expect(mockResponse.json).toHaveBeenCalledWith({
      mockRequest,
      token: "newToken",
    });
  });

  test("loginUser should return 400 if email or password is missing", async () => {
    const mockRequest = { body: { email: "test@example.com" } }; // Missing password

    await controller.loginUser(mockRequest as any, mockResponse);

    expect(authServiceMock.login).not.toHaveBeenCalled(); // Service should not be called
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      "Email and password are required"
    );
  });

  test("loginUser should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      body: { email: "test@example.com", password: "123456" },
    };
    const mockError = new Error("Login failed");

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
          id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
          email: "santi123@hotmail.com",
        },
      },
    };

    const respMessage = `User with email ${mockRequest.params.token.email} validated`;

    authServiceMock.validate.mockResolvedValue(respMessage);
    await controller.validateUser(mockRequest as any, mockResponse);

    expect(authServiceMock.validate).toHaveBeenCalledTimes(1);
    expect(authServiceMock.validate).toHaveBeenCalledWith(
      mockRequest.params.token
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(respMessage);
  });

  test("validateUser should return a 404 if token is missing", async () => {
    const mockRequest = {
      params: {},
    };

    await controller.validateUser(mockRequest as any, mockResponse);

    expect(authServiceMock.validate).not.toHaveBeenCalled(); // Service should not be called
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith("Token not found");
  });

  test("validateUser should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: {
        token: {
          id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
          email: "santiarteche@hotmail.com",
        },
      },
    };
    const mockError = new Error("Error in validation");

    authServiceMock.validate.mockRejectedValue(mockError);
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
          id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        },
      },
    };

    const respMessage = `User with email ${mockRequest.headers.cookie.email} validated`;

    authServiceMock.validateLogin.mockResolvedValue(respMessage);
    await controller.validateLogin(mockRequest as any, mockResponse);

    expect(authServiceMock.validateLogin).toHaveBeenCalledTimes(1);
    expect(authServiceMock.validateLogin).toHaveBeenCalledWith(
      mockRequest.headers.cookie
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(respMessage);
  });

  test("validateLogin should return 404 if cookie is missing", async () => {
    const mockRequest = {
      headers: {},
    };

    await controller.validateLogin(mockRequest as any, mockResponse);

    expect(authServiceMock.validateLogin).not.toHaveBeenCalled(); // Service should not be called
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith("Cookie not found");
  });

  test("validateLogin should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      headers: {
        cookie: {
          id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
          email: "santiarteche@hotmail.com",
        },
      },
    };
    const mockError = new Error("Error in validation");

    authServiceMock.validateLogin.mockRejectedValue(mockError);
    await controller.validateLogin(mockRequest as any, mockResponse);

    expect(authServiceMock.validateLogin).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
});
