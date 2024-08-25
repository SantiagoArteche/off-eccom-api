import { CustomError } from "../../../src/domain/errors/custom-errors";
import { UserController } from "../../../src/presentation/users/controller";
describe("test on users/controller.ts", () => {
  let userServiceMock: any;
  let mockResponse: any;
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
      send: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("must create an instance of user controller", () => {
    const controller = new UserController(userServiceMock);

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
    const mockRequest = { query: { limit: 3, page: 2 } };
    const resolvedValue = {
      currentPage: mockRequest.query.page,
      limit: mockRequest.query.limit,
      prev: expect.any(String),
      next: expect.any(String),
      totalUsers: 1,
      users: [
        {
          id: 1,
          age: 22,
          firstName: "Santiago",
          lastName: "Arteche",
          email: "sanarteche@hotmail.com",
          isValidated: false,
        },
      ],
    };

    const controller = new UserController(userServiceMock);
    userServiceMock.getAll.mockResolvedValue(resolvedValue);
    await controller.getUsers(mockRequest as any, mockResponse);

    expect(userServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(userServiceMock.getAll).toHaveBeenCalledWith(mockRequest.query);

    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  test("getUsers must return status 400 if pagination is missing or invalid", async () => {
    const mockRequest = { query: { limit: "b", page: 2 } };

    const controller = new UserController(userServiceMock);

    await controller.getUsers(mockRequest as any, mockResponse);

    expect(userServiceMock.getAll).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be numbers"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getUsers should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = { query: { limit: 3, page: 2 } };

    const mockError = new Error("Bad request");

    const controller = new UserController(userServiceMock);

    userServiceMock.getAll.mockRejectedValue(mockError);
    await controller.getUsers(mockRequest as any, mockResponse);

    expect(userServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("getUserById must return an object with the user", async () => {
    const mockRequest = { params: { id: 123456 } };

    const controller = new UserController(userServiceMock);

    const resolvedValue = {
      user: {
        id: 123456,
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
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getUserById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = { params: { id: 123456 } };

    const controller = new UserController(userServiceMock);

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

    const controller = new UserController(userServiceMock);

    const resolvedValue = {
      msg: "User Created",
      user: {
        id: 123456,
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
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
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

    const controller = new UserController(userServiceMock);

    const mockError = new Error("Bad request");
    await userServiceMock.create.mockRejectedValue(mockError);
    await controller.createUser(mockRequest as any, mockResponse);

    expect(userServiceMock.create).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("updateUserById must return an object with a msg and the user", async () => {
    const mockRequest = {
      params: { id: 12346 },
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
    const controller = new UserController(userServiceMock);

    await userServiceMock.update.mockResolvedValue(resolvedValue);
    await controller.updateUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.update).toHaveBeenCalledTimes(1);
    expect(userServiceMock.update).toHaveBeenCalledWith(
      mockRequest.body,
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("updateUserById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: 12346 },
      body: {
        age: 22,
        firstName: "Santiago",
        lastName: "Arteche",
        email: "sanarteche@hotmail.com",
        password: "123456",
      },
    };

    const controller = new UserController(userServiceMock);
    const mockError = new Error("Bad request");

    await userServiceMock.update.mockRejectedValue(mockError);
    await controller.updateUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.update).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("deleteUserById must return a string with the user id", async () => {
    const mockRequest = { params: { id: 123456 } };

    const resolvedValue = `User with id ${mockRequest.params.id} was deleted`;
    const controller = new UserController(userServiceMock);

    await userServiceMock.delete.mockResolvedValue(resolvedValue);
    await controller.deleteUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.delete).toHaveBeenCalledTimes(1);
    expect(userServiceMock.delete).toHaveBeenCalledWith(mockRequest.params.id);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("deleteUserById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: 12346 },
    };

    const controller = new UserController(userServiceMock);

    const mockError = new Error("Bad request");
    await userServiceMock.delete.mockRejectedValue(mockError);
    await controller.deleteUserById(mockRequest as any, mockResponse);

    expect(userServiceMock.delete).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("reSendValidation should return a string with an user email", async () => {
    const mockRequest = { params: { id: 123456 } };

    const userEmail = "santiagoarteche@hotmail.com";
    // find the email of the user in prisma with his ID
    const resolvedValue = `Email resend to ${userEmail}`;

    const controller = new UserController(userServiceMock);

    await userServiceMock.reSendValidationMail.mockResolvedValue(resolvedValue);
    await controller.reSendValidation(mockRequest as any, mockResponse);

    expect(userServiceMock.reSendValidationMail).toHaveBeenCalledTimes(1);
    expect(userServiceMock.reSendValidationMail).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("reSendValidation should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: 12346 },
    };

    const controller = new UserController(userServiceMock);

    const mockError = new Error("Bad request");
    await userServiceMock.reSendValidationMail.mockRejectedValue(mockError);
    await controller.reSendValidation(mockRequest as any, mockResponse);

    expect(userServiceMock.reSendValidationMail).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
});
