import { CustomError } from "../../../src/domain/errors/custom-errors";
import { ProductController } from "../../../src/presentation/products/controller";
describe("tests on products/controller.ts", () => {
  let productMockService: any;
  let mockResponse: any;
  let controller: ProductController;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(() => {
    productMockService = {
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
    controller = new ProductController(productMockService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("must create an instance of product controller", () => {
    expect(controller).toBeInstanceOf(ProductController);
    expect(controller).toHaveProperty("getProducts");
    expect(controller).toHaveProperty("getProductById");
    expect(controller).toHaveProperty("createProduct");
    expect(controller).toHaveProperty("updateProduct");
    expect(controller).toHaveProperty("deleteProduct");
    expect(typeof controller.getProducts).toBe("function");
    expect(typeof controller.getProductById).toBe("function");
    expect(typeof controller.createProduct).toBe("function");
    expect(typeof controller.updateProduct).toBe("function");
    expect(typeof controller.deleteProduct).toBe("function");
  });

  test("getProducts must return an object with products, pages and limit", async () => {
    const mockRequest = { query: { limit: 10, page: 1 } };
    const resolvedValue = {
      currentPage: mockRequest.query.page,
      limit: mockRequest.query.limit,
      prev: null,
      next: expect.any(String),
      totalProducts: 1,
      products: [
        {
          id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
          name: "newProduct",
          category: "validCategory",
          price: 3300,
          stock: 12,
          lowStock: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
    };

    await productMockService.getAll.mockResolvedValue(resolvedValue);
    await controller.getProducts(mockRequest as any, mockResponse);

    expect(productMockService.getAll).toHaveBeenCalledTimes(1);
    expect(productMockService.getAll).toHaveBeenCalledWith(mockRequest.query);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getProducts should return 400 if limit or page are not numbers", async () => {
    const mockRequest = { query: { page: 4, limit: "bb" } };

    controller.getProducts(mockRequest as any, mockResponse);

    expect(productMockService.getAll).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be numbers"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getProducts should return 400 if limit or page are less than 0", async () => {
    const mockRequest = { query: { page: 4, limit: -1 } };

    controller.getProducts(mockRequest as any, mockResponse);

    expect(productMockService.getAll).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be greater than 0"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getProducts should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = { query: { page: 3, limit: 3 } };

    const mockError = new Error("Bad request");

    await productMockService.getAll.mockRejectedValue(mockError);
    await controller.getProducts(mockRequest as any, mockResponse);

    expect(productMockService.getAll).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("getProductById must return an object with the product", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = {
      id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      name: "newProduct",
      category: "validCategory",
      price: 3300,
      stock: 12,
      lowStock: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    };

    await productMockService.getById.mockResolvedValue(resolvedValue);
    await controller.getProductById(mockRequest as any, mockResponse);

    expect(productMockService.getById).toHaveBeenCalledTimes(1);
    expect(productMockService.getById).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getProductById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await productMockService.getById.mockRejectedValue(mockError);
    await controller.getProductById(mockRequest as any, mockResponse);

    expect(productMockService.getById).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("createProduct must return an object with the new product", async () => {
    const mockRequest = {
      body: {
        name: "newProduct",
        category: "validCategory",
        price: 3300,
        stock: 12,
        lowStock: false,
        createdAt: "2024-08-25",
      },
    };

    const resolvedValue = {
      product: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        ...mockRequest.body,
      },
    };

    await productMockService.create.mockResolvedValue(resolvedValue);
    await controller.createProduct(mockRequest as any, mockResponse);

    expect(productMockService.create).toHaveBeenCalledTimes(1);
    expect(productMockService.create).toHaveBeenCalledWith({
      ...mockRequest.body,
      createdAt: new Date(mockRequest.body.createdAt),
    });

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("createProduct should return a error if the request body is missing required property or have wrong values", async () => {
    const mockRequest = {
      body: {},
    };

    await controller.createProduct(mockRequest as any, mockResponse);

    expect(productMockService.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("Name is required");
  });

  test("createProduct should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      body: {
        name: "newProduct",
        category: "validCategory",
        price: 3300,
        stock: 12,
        lowStock: false,
        createdAt: expect.any(Date),
      },
    };

    const mockError = new Error("Bad request");

    await productMockService.create.mockRejectedValue(mockError);
    await controller.createProduct(mockRequest as any, mockResponse);

    expect(productMockService.create).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("deleteProductById must return a string with the product id", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = `Product with id ${mockRequest.params.id} was deleted`;

    await productMockService.delete.mockResolvedValue(resolvedValue);
    await controller.deleteProduct(mockRequest as any, mockResponse);

    expect(productMockService.delete).toHaveBeenCalledTimes(1);
    expect(productMockService.delete).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("deleteProductById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await productMockService.delete.mockRejectedValue(mockError);
    await controller.deleteProduct(mockRequest as any, mockResponse);

    expect(productMockService.delete).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("updateProduct must return an object with the updated product", async () => {
    const mockRequest = {
      params: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
      body: {
        name: "newProduct",
        category: "validCategory",
        price: 3300,
        stock: 3,
        createdAt: "2024-08-25",
      },
    };

    const resolvedValue = {
      id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      name: "newProduct",
      category: "validCategory",
      price: 3300,
      stock: 3,
      lowStock: true,
      createdAt: "2024-08-25",
    };
    await productMockService.update.mockResolvedValue(resolvedValue);
    await controller.updateProduct(mockRequest as any, mockResponse);

    expect(productMockService.update).toHaveBeenCalledTimes(1);
    expect(productMockService.update).toHaveBeenCalledWith(
      mockRequest.params.id,
      {
        ...mockRequest.body,
        createdAt: new Date(mockRequest.body.createdAt),
        lowStock: true,
      }
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("updateProduct should return a error if the request body is missing required property or have wrong values", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
      body: {
        name: 123213,
      },
    };

    await controller.updateProduct(mockRequest as any, mockResponse);

    expect(productMockService.update).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("Name must be a string");
  });

  test("updateProduct should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
      body: {
        name: "newProduct",
        category: "validCategory",
        price: 3300,
        stock: 12,
        lowStock: false,
        createdAt: expect.any(Date),
      },
    };

    const mockError = new Error("Bad request");

    await productMockService.update.mockRejectedValue(mockError);
    await controller.updateProduct(mockRequest as any, mockResponse);

    expect(productMockService.update).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
});
