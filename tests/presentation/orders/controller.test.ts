import { CustomError } from "../../../src/domain/errors/custom-errors";
import { OrderController } from "../../../src/presentation/orders/controller";
describe("tests on orders/controller.ts", () => {
  let mockResponse: any;
  let orderServiceMock: any;
  let controller: OrderController;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(() => {
    orderServiceMock = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      pay: jest.fn(),
      update: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    controller = new OrderController(orderServiceMock);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("must create an instance of orders controller", () => {
    expect(controller).toBeInstanceOf(OrderController);
    expect(controller).toHaveProperty("getAllOrders");
    expect(controller).toHaveProperty("getOrderById");
    expect(controller).toHaveProperty("createOrder");
    expect(controller).toHaveProperty("updateOrder");
    expect(controller).toHaveProperty("deleteOrder");
    expect(controller).toHaveProperty("payOrder");
    expect(typeof controller.getAllOrders).toBe("function");
    expect(typeof controller.getOrderById).toBe("function");
    expect(typeof controller.createOrder).toBe("function");
    expect(typeof controller.deleteOrder).toBe("function");
    expect(typeof controller.updateOrder).toBe("function");
    expect(typeof controller.payOrder).toBe("function");
  });

  test("getAllOrders must return an object with categories, pages and limit", async () => {
    const mockRequest = { query: { limit: 10, page: 1 } };
    const resolvedValue = {
      currentPage: mockRequest.query.page,
      limit: mockRequest.query.limit,
      prev: null,
      next: expect.any(String),
      totalOrders: 0,
      orders: [],
    };

    await orderServiceMock.getAll.mockResolvedValue(resolvedValue);
    await controller.getAllOrders(mockRequest as any, mockResponse);

    expect(orderServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(orderServiceMock.getAll).toHaveBeenCalledWith(mockRequest.query);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getAllOrders should return 400 if limit or page are not numbers", async () => {
    const mockRequest = { query: { page: 4, limit: "bb" } };

    controller.getAllOrders(mockRequest as any, mockResponse);

    expect(orderServiceMock.getAll).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be numbers"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getAllOrders should return 400 if limit or page are less than 0", async () => {
    const mockRequest = { query: { page: 4, limit: -1 } };

    controller.getAllOrders(mockRequest as any, mockResponse);

    expect(orderServiceMock.getAll).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be greater than 0"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getAllOrders should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = { query: { page: 3, limit: 3 } };

    const mockError = new Error("Bad request");

    await orderServiceMock.getAll.mockRejectedValue(mockError);
    await controller.getAllOrders(mockRequest as any, mockResponse);

    expect(orderServiceMock.getAll).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("getOrderById must return an object with the order", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = {
      order: {
        id: "6bb0ea14-47ec-43c1-a227-391cbc28df18",
        cartId: "477bf64d-c052-47a3-9a59-a410ed06f205",
        createdAt: "2024-08-26T00:12:22.347Z",
        discount: 0,
        finalPrice: 3993,
        itemsInOrder: [
          {
            name: "newProduct",
            quantity: 1,
          },
        ],
        paidBy: null,
      },
    };

    await orderServiceMock.getById.mockResolvedValue(resolvedValue);
    await controller.getOrderById(mockRequest as any, mockResponse);

    expect(orderServiceMock.getById).toHaveBeenCalledTimes(1);
    expect(orderServiceMock.getById).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getOrderById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await orderServiceMock.getById.mockRejectedValue(mockError);
    await controller.getOrderById(mockRequest as any, mockResponse);

    expect(orderServiceMock.getById).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("createOrder must return an object with the new order", async () => {
    const mockRequest = {
      params: {
        cartId: "477bf64d-c052-47a3-9a59-a410ed06f205",
      },
      body: {
        discount: 0,
      },
    };

    const resolvedValue = {
      order: {
        id: "6bb0ea14-47ec-43c1-a227-391cbc28df18",
        cartId: "477bf64d-c052-47a3-9a59-a410ed06f205",
        createdAt: "2024-08-26T00:12:22.347Z",
        discount: 0,
        finalPrice: 3993,
        itemsInOrder: [
          {
            name: "newProduct",
            quantity: 1,
          },
        ],
        paidBy: null,
      },
      userId: "7xx7ea14-47ec-43c1-a227-391cbc28df18",
    };

    await orderServiceMock.create.mockResolvedValue(resolvedValue);
    await controller.createOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.create).toHaveBeenCalledTimes(1);
    expect(orderServiceMock.create).toHaveBeenCalledWith(
      mockRequest.params.cartId,
      mockRequest.body.discount
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("createOrder should return a error if discount isNaN", async () => {
    const mockRequest = {
      params: {
        cartId: "477bf64d-c052-47a3-9a59-a410ed06f205",
      },
      body: {
        discount: "bcdf",
      },
    };

    await controller.createOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("Discount must be a number");
  });

  test("createOrder should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: {
        cartId: "477bf64d-c052-47a3-9a59-a410ed06f205",
      },
      body: {
        discount: null,
      },
    };

    const mockError = new Error("Bad request");

    await orderServiceMock.create.mockRejectedValue(mockError);
    await controller.createOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.create).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("updateOrder must return an object with the updated order", async () => {
    const mockRequest = {
      params: {
        orderId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        cartId: "477bf64d-c052-47a3-9a59-a410ed06f205",
      },
      body: {
        discount: 30,
      },
    };

    const resolvedValue = {
      updatedOrder: {
        id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        cartId: "477bf64d-c052-47a3-9a59-a410ed06f205",
        createdAt: "2024-08-26T00:12:22.347Z",
        discount: 30,
        finalPrice: 3993,
        itemsInOrder: [
          {
            name: "newProduct",
            quantity: 1,
          },
        ],
        paidBy: null,
      },
    };
    await orderServiceMock.update.mockResolvedValue(resolvedValue);
    await controller.updateOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.update).toHaveBeenCalledTimes(1);
    expect(orderServiceMock.update).toHaveBeenCalledWith(
      mockRequest.params.orderId,
      mockRequest.params.cartId,
      mockRequest.body.discount
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
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

    await orderServiceMock.update.mockRejectedValue(mockError);
    await controller.updateOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.update).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
  test("deleteOrder must return a string with the order id", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = `Order with id ${mockRequest.params.id} was deleted`;

    await orderServiceMock.delete.mockResolvedValue(resolvedValue);
    await controller.deleteOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.delete).toHaveBeenCalledTimes(1);
    expect(orderServiceMock.delete).toHaveBeenCalledWith(mockRequest.params.id);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("deleteCategory should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await orderServiceMock.delete.mockRejectedValue(mockError);
    await controller.deleteOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.delete).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("payOrder must return an object with the paid order and a msg", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = {
      msg: `Order with id ${mockRequest.params.id} was paid!`,
      paidOrder: {
        id: "6bb0ea14-47ec-43c1-a227-391cbc28df18",
        cartId: null,
        createdAt: "2024-08-26T00:12:22.347Z",
        discount: 0,
        finalPrice: 3993,
        itemsInOrder: [
          {
            name: "newProduct",
            quantity: 1,
          },
        ],
        paidBy: "7xx7ea14-47ec-43c1-a227-391cbc28df18",
      },
    };

    await orderServiceMock.pay.mockResolvedValue(resolvedValue);
    await controller.payOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.pay).toHaveBeenCalledTimes(1);
    expect(orderServiceMock.pay).toHaveBeenCalledWith(mockRequest.params.id);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("payOrder should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await orderServiceMock.pay.mockRejectedValue(mockError);
    await controller.payOrder(mockRequest as any, mockResponse);

    expect(orderServiceMock.pay).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
});
