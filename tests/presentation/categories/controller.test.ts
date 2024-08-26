import { CustomError } from "../../../src/domain/errors/custom-errors";
import { CategoryController } from "../../../src/presentation/categories/controller";
describe("tests on categories/controller.ts", () => {
  let categoryMockService: any;
  let mockResponse: any;
  let controller: CategoryController;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(() => {
    categoryMockService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    controller = new CategoryController(categoryMockService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("must create an instance of category controller", () => {
    expect(controller).toBeInstanceOf(CategoryController);
    expect(controller).toHaveProperty("getCategory");
    expect(controller).toHaveProperty("getCategories");
    expect(controller).toHaveProperty("createCategory");
    expect(controller).toHaveProperty("updateCategory");
    expect(controller).toHaveProperty("deleteCategory");
    expect(typeof controller.getCategory).toBe("function");
    expect(typeof controller.getCategories).toBe("function");
    expect(typeof controller.createCategory).toBe("function");
    expect(typeof controller.deleteCategory).toBe("function");
    expect(typeof controller.updateCategory).toBe("function");
  });

  test("getCategories must return an object with categories, pages and limit", async () => {
    const mockRequest = { query: { limit: 10, page: 1 } };
    const resolvedValue = {
      currentPage: mockRequest.query.page,
      limit: mockRequest.query.limit,
      prev: null,
      next: expect.any(String),
      totalCategories: 1,
      categories: [
        {
          id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
          name: "shoes",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
    };

    await categoryMockService.getAll.mockResolvedValue(resolvedValue);
    await controller.getCategories(mockRequest as any, mockResponse);

    expect(categoryMockService.getAll).toHaveBeenCalledTimes(1);
    expect(categoryMockService.getAll).toHaveBeenCalledWith(mockRequest.query);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getCategories should return 400 if limit or page are not numbers", async () => {
    const mockRequest = { query: { page: 4, limit: "bb" } };

    controller.getCategories(mockRequest as any, mockResponse);

    expect(categoryMockService.getAll).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be numbers"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getCategories should return 400 if limit or page are less than 0", async () => {
    const mockRequest = { query: { page: 4, limit: -1 } };

    controller.getCategories(mockRequest as any, mockResponse);

    expect(categoryMockService.getAll).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be greater than 0"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getCategories should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = { query: { page: 3, limit: 3 } };

    const mockError = new Error("Bad request");

    await categoryMockService.getAll.mockRejectedValue(mockError);
    await controller.getCategories(mockRequest as any, mockResponse);

    expect(categoryMockService.getAll).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("getCategory must return an object with the category", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = {
      category: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        name: "newCategory",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    };

    await categoryMockService.getById.mockResolvedValue(resolvedValue);
    await controller.getCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.getById).toHaveBeenCalledTimes(1);
    expect(categoryMockService.getById).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getCategory should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await categoryMockService.getById.mockRejectedValue(mockError);
    await controller.getCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.getById).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("createCategory must return an object with the new category", async () => {
    const mockRequest = {
      body: {
        name: "newCategory",
        createdAt: "2024-8-8",
      },
    };

    const resolvedValue = {
      category: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        name: "newCategory",
        createdAt: "2024-8-8",
        updatedAt: new Date(),
      },
    };

    await categoryMockService.create.mockResolvedValue(resolvedValue);
    await controller.createCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.create).toHaveBeenCalledTimes(1);
    expect(categoryMockService.create).toHaveBeenCalledWith({
      name: mockRequest.body.name,
      createdAt: new Date(mockRequest.body.createdAt),
    });

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("createCategory should return a error if the request body is missing name", async () => {
    const mockRequest = {
      body: {},
    };

    await controller.createCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("Name is required");
  });

  test("createCategory should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      body: {
        name: "newCategory",
      },
    };

    const mockError = new Error("Bad request");

    await categoryMockService.create.mockRejectedValue(mockError);
    await controller.createCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.create).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("deleteCategory must return a string with the category id", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = `Category with id ${mockRequest.params.id} was deleted`;

    await categoryMockService.delete.mockResolvedValue(resolvedValue);
    await controller.deleteCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.delete).toHaveBeenCalledTimes(1);
    expect(categoryMockService.delete).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("deleteCategory should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await categoryMockService.delete.mockRejectedValue(mockError);
    await controller.deleteCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.delete).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("updateCategory must return an object with the updated category", async () => {
    const mockRequest = {
      params: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
      body: {
        name: "newCategory",
        createdAt: "2024-08-25",
      },
    };

    const resolvedValue = {
      updatedCategory: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        name: "newCategory",
        createdAt: "2024-08-25",
      },
    };
    await categoryMockService.update.mockResolvedValue(resolvedValue);
    await controller.updateCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.update).toHaveBeenCalledTimes(1);
    expect(categoryMockService.update).toHaveBeenCalledWith(
      mockRequest.params.id,
      {
        ...mockRequest.body,
        createdAt: new Date(mockRequest.body.createdAt),
      }
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("updateCategory should return a error if the request body have wrong values", async () => {
    const mockRequest = {
      params: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
      body: {
        name: 3112312,
      },
    };

    await controller.updateCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.update).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("Name must be a string");
  });

  test("updateCategory should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
      body: {
        name: "newCategory",
        createdAt: expect.any(Date),
      },
    };

    const mockError = new Error("Bad request");

    await categoryMockService.update.mockRejectedValue(mockError);
    await controller.updateCategory(mockRequest as any, mockResponse);

    expect(categoryMockService.update).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
});
