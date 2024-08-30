import { CustomError } from "../../../../src/domain/errors/custom-errors";
import { UserController } from "../../../../src/presentation/users/controller";
describe("test on users/controller.ts", () => {
  let userServiceMock: any;
  let mockResponse: any;
  let controller: UserController;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(() => {
    userServiceMock = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      sendValidationMail: jest.fn(),
      reSendValidationMail: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    controller = new UserController(userServiceMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("must create an instance of user controller", () => {
    expect(controller).toBeInstanceOf(UserController);
    expect(controller).toHaveProperty("createUser");
    expect(controller).toHaveProperty("deleteUserById");
    expect(controller).toHaveProperty("getUserById");
    expect(controller).toHaveProperty("getUsers");
    expect(controller).toHaveProperty("reSendValidation");
    expect(controller).toHaveProperty("updateUserById");
    expect(typeof controller.createUser).toBe("function");
    expect(typeof controller.deleteUserById).toBe("function");
    expect(typeof controller.getUserById).toBe("function");
    expect(typeof controller.getUsers).toBe("function");
    expect(typeof controller.reSendValidation).toBe("function");
    expect(typeof controller.updateUserById).toBe("function");
  });

  test("getUsers must return an object with users, pages and limit", async () => {
    const mockRequest = { query: { limit: 3, page: 1 } };
    const resolvedValue = {
      currentPage: mockRequest.query.page,
      limit: mockRequest.query.limit,
      prev: expect.any(String),
      next: expect.any(String),
      totalUsers: 1,
      users: [
        {
          id: expect.any(String),
          age: 22,
          firstName: "Santiago",
          lastName: "Arteche",
          email: "sanarteche@hotmail.com",
          isValidated: false,
        },
      ],
    };

    userServiceMock.getAll.mockResolvedValue(resolvedValue);
    await controller.getUsers(mockRequest as any, mockResponse);

    expect(userServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(userServiceMock.getAll).toHaveBeenCalledWith(mockRequest.query);

    expect(mockResponse.json).toHaveBeenCalledWith(resolvedValue);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  test("getUsers must return status 400 if pagination is missing or invalid", async () => {
    const mockRequest = { query: { limit: "b", page: 2 } };

    await controller.getUsers(mockRequest as any, mockResponse);

    expect(userServiceMock.getAll).not.toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(
      "Page and limit must be numbers"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getUsers should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = { query: { limit: 3, page: 2 } };

    const mockError = new Error("Bad request");

    userServiceMock.getAll.mockRejectedValue(mockError);
    await controller.getUsers(mockRequest as any, mockResponse);

    expect(userServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("getUserById must return an object with the user", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = {
      user: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        age: 22,
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        isValidated: false,
      },
    };
    await userServiceMock.getById.mockResolvedValue(resolvedValue);
    await controller.getUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
    expect(userServiceMock.getById).toHaveBeenCalledWith(mockRequest.params.id);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(resolvedValue);
  });

  test("getUserById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");
    await userServiceMock.getById.mockRejectedValue(mockError);
    await controller.getUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.getById).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("createUser must return an object with a msg and the user", async () => {
    const mockRequest = {
      body: {
        age: 22,
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        password: "123456",
      },
    };

    const resolvedValue = {
      msg: "User Created",
      user: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        age: 22,
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        isValidated: false,
      },
    };
    await userServiceMock.create.mockResolvedValue(resolvedValue);
    await controller.createUser(mockRequest as any, mockResponse);

    expect(userServiceMock.create).toHaveBeenCalledTimes(1);
    expect(userServiceMock.create).toHaveBeenCalledWith(mockRequest.body);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(resolvedValue);
  });

  test("createUser should return a error if the request body have missing properties or wrong values", async () => {
    const mockRequest = {
      body: {
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        password: "123456",
      },
    };

    await controller.createUser(mockRequest as any, mockResponse);

    expect(userServiceMock.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith("Age is required");
  });

  test("createUser should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      body: {
        age: 22,
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        password: "123456",
      },
    };

    const mockError = new Error("Bad request");
    await userServiceMock.create.mockRejectedValue(mockError);
    await controller.createUser(mockRequest as any, mockResponse);

    expect(userServiceMock.create).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("updateUserById must return an object with a msg and the user", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
      body: {
        age: 22,
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        password: "123456",
      },
    };

    const resolvedValue = {
      msg: "User Updated",
      user: {
        id: mockRequest.params.id,
        age: mockRequest.body.age,
        firstName: mockRequest.body.firstName,
        lastName: mockRequest.body.lastName,
        email: mockRequest.body.email,
      },
    };

    await userServiceMock.update.mockResolvedValue(resolvedValue);
    await controller.updateUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.update).toHaveBeenCalledTimes(1);
    expect(userServiceMock.update).toHaveBeenCalledWith(
      mockRequest.body,
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(resolvedValue);
  });

  test("updateUserById should return a error if the request body have wrong values", async () => {
    const mockRequest = {
      params: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
      body: {
        age: "bbb",
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        password: "123456",
      },
    };

    await controller.updateUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.update).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith("Age must be a number");
  });

  test("updateUserById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
      body: {
        age: 22,
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        password: "123456",
      },
    };

    const mockError = new Error("Bad request");

    await userServiceMock.update.mockRejectedValue(mockError);
    await controller.updateUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.update).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("deleteUserById must return a string with the user id", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = `User with id ${mockRequest.params.id} was deleted`;

    await userServiceMock.delete.mockResolvedValue(resolvedValue);
    await controller.deleteUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.delete).toHaveBeenCalledTimes(1);
    expect(userServiceMock.delete).toHaveBeenCalledWith(mockRequest.params.id);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(resolvedValue);
  });

  test("deleteUserById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");
    await userServiceMock.delete.mockRejectedValue(mockError);
    await controller.deleteUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.delete).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("reSendValidation should return a string with an user email", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const userEmail = "santiagoarteche@hotmail.com";
    // find the email of the user in prisma with his ID
    const resolvedValue = `Email resend to ${userEmail}`;

    await userServiceMock.reSendValidationMail.mockResolvedValue(resolvedValue);
    await controller.reSendValidation(mockRequest as any, mockResponse);

    expect(userServiceMock.reSendValidationMail).toHaveBeenCalledTimes(1);
    expect(userServiceMock.reSendValidationMail).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(resolvedValue);
  });

  test("reSendValidation should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");
    await userServiceMock.reSendValidationMail.mockRejectedValue(mockError);
    await controller.reSendValidation(mockRequest as any, mockResponse);

    expect(userServiceMock.reSendValidationMail).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
});
