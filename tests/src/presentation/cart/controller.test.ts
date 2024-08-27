import { CustomError } from "../../../../src/domain/errors/custom-errors";
import { CartController } from "../../../../src/presentation/cart/controller";


describe("tests on cart/controller.ts", () => {
  let cartMockService: any;
  let mockResponse: any;
  let controller: CartController;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(() => {
    cartMockService = {
      getCarts: jest.fn(),
      deleteCart: jest.fn(),
      getCartById: jest.fn(),
      addProductToCart: jest.fn(),
      createCart: jest.fn(),
      deleteOneProduct: jest.fn(),
      removeProduct: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    controller = new CartController(cartMockService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("must create an instance of cart controller", () => {
    expect(controller).toBeInstanceOf(CartController);
    expect(controller).toHaveProperty("getCarts");
    expect(controller).toHaveProperty("getCartById");
    expect(controller).toHaveProperty("addProductToCart");
    expect(controller).toHaveProperty("deleteCartItem");
    expect(controller).toHaveProperty("removeProductFromCart");
    expect(controller).toHaveProperty("deleteCart");
    expect(controller).toHaveProperty("createCart");
    expect(typeof controller.getCarts).toBe("function");
    expect(typeof controller.getCartById).toBe("function");
    expect(typeof controller.createCart).toBe("function");
    expect(typeof controller.deleteCart).toBe("function");
    expect(typeof controller.addProductToCart).toBe("function");
    expect(typeof controller.deleteCartItem).toBe("function");
    expect(typeof controller.removeProductFromCart).toBe("function");
  });

  test("getCarts must return an object with carts, pages and limit", async () => {
    const mockRequest = { query: { limit: 10, page: 1 } };
    const resolvedValue = {
      currentPage: mockRequest.query.page,
      limit: mockRequest.query.limit,
      prev: null,
      next: expect.any(String),
      totalCarts: 0,
      allCarts: [],
    };

    await cartMockService.getCarts.mockResolvedValue(resolvedValue);
    await controller.getCarts(mockRequest as any, mockResponse);

    expect(cartMockService.getCarts).toHaveBeenCalledTimes(1);
    expect(cartMockService.getCarts).toHaveBeenCalledWith(mockRequest.query);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getCarts should return 400 if limit or page are not numbers", async () => {
    const mockRequest = { query: { page: 4, limit: "bb" } };

    await controller.getCarts(mockRequest as any, mockResponse);

    expect(cartMockService.getCarts).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be numbers"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getCarts should return 400 if limit or page are less than 0", async () => {
    const mockRequest = { query: { page: 4, limit: -1 } };

    await controller.getCarts(mockRequest as any, mockResponse);

    expect(cartMockService.getCarts).not.toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(
      "Page and limit must be greater than 0"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test("getCarts should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = { query: { limit: 10, page: 1 } };

    const mockError = new Error("Bad request");

    await cartMockService.getCarts.mockRejectedValue(mockError);
    await controller.getCarts(mockRequest as any, mockResponse);

    expect(cartMockService.getCarts).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("getCartById must return an object with the cart", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };
    const resolvedValue = {
      id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      userId: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
      placeOrder: false,
      total: 0,
      subtotal: 0,
      tax: 0,
      cartItemId: [],
    };

    await cartMockService.getCartById.mockResolvedValue(resolvedValue);
    await controller.getCartById(mockRequest as any, mockResponse);

    expect(cartMockService.getCartById).toHaveBeenCalledTimes(1);
    expect(cartMockService.getCartById).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("getCartById should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await cartMockService.getCartById.mockRejectedValue(mockError);
    await controller.getCartById(mockRequest as any, mockResponse);

    expect(cartMockService.getCartById).toHaveBeenCalledTimes(1);

    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("addProductToCart must return an object with a msg and the updated cart", async () => {
    const mockRequest = {
      params: {
        productId: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
        cartId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
      body: {
        quantity: 3,
      },
    };

    const resolvedValue = {
      id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      userId: "c7c13a5b-c8df-4405-b607-75a4aa9c557e",
      placeOrder: false,
      total: 0,
      subtotal: 0,
      tax: 0,
      cartItemId: ["z7x13x5a-d9rz-4405-b607-75a4aa9c557e"],
    };

    await cartMockService.addProductToCart.mockResolvedValue(resolvedValue);
    await controller.addProductToCart(mockRequest as any, mockResponse);

    expect(cartMockService.addProductToCart).toHaveBeenCalledTimes(1);
    expect(cartMockService.addProductToCart).toHaveBeenLastCalledWith(
      mockRequest.params.productId,
      mockRequest.params.cartId,
      mockRequest.body
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("addProductToCart must fail if quantity isNaN", async () => {
    const mockRequest = {
      params: {
        productId: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
        cartId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
      body: { quantity: "abc" },
    };

    await controller.addProductToCart(mockRequest as any, mockResponse);

    expect(cartMockService.addProductToCart).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("Quantity must be a number");
  });

  test("addProductToCart should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: {
        productId: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
        cartId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
      body: {
        quantity: 3,
      },
    };

    const mockError = new Error("Bad request");

    await cartMockService.addProductToCart.mockRejectedValue(mockError);
    await controller.addProductToCart(mockRequest as any, mockResponse);

    expect(cartMockService.addProductToCart).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("createCart return an object with a msg and the updated cart", async () => {
    const mockRequest = {
      params: { userId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = {
      id: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
      userId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      placeOrder: false,
      total: 0,
      subtotal: 0,
      tax: 0,
      cartItemId: [],
    };

    await cartMockService.createCart.mockResolvedValue(resolvedValue);
    await controller.createCart(mockRequest as any, mockResponse);

    expect(cartMockService.createCart).toHaveBeenCalledTimes(1);
    expect(cartMockService.createCart).toHaveBeenCalledWith(
      mockRequest.params.userId
    );
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("createCart should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { userId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await cartMockService.createCart.mockRejectedValue(mockError);
    await controller.createCart(mockRequest as any, mockResponse);

    expect(cartMockService.createCart).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenLastCalledWith(
      mockError,
      mockResponse
    );
  });

  test("deleteCart must return a string with the cart id deleted", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const resolvedValue = `Cart with id ${mockRequest.params.id} was deleted`;

    await cartMockService.deleteCart.mockResolvedValue(resolvedValue);
    await controller.deleteCart(mockRequest as any, mockResponse);

    expect(cartMockService.deleteCart).toHaveBeenCalledTimes(1);
    expect(cartMockService.deleteCart).toHaveBeenCalledWith(
      mockRequest.params.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("deleteCart should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: { id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e" },
    };

    const mockError = new Error("Bad request");

    await cartMockService.deleteCart.mockRejectedValue(mockError);
    await controller.deleteCart(mockRequest as any, mockResponse);

    expect(cartMockService.deleteCart).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("deleteCartItem must return a string with product id and cart id", async () => {
    const mockRequest = {
      params: {
        productId: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
        cartId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
    };

    const resolvedValue = `Quantity on product ${mockRequest.params.productId} from cart ${mockRequest.params.cartId} was updated`;

    await cartMockService.deleteOneProduct.mockResolvedValue(resolvedValue);
    await controller.deleteCartItem(mockRequest as any, mockResponse);

    expect(cartMockService.deleteOneProduct).toHaveBeenCalledTimes(1);
    expect(cartMockService.deleteOneProduct).toHaveBeenCalledWith(
      mockRequest.params.productId,
      mockRequest.params.cartId
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("deleteCartItem should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: {
        cartId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        productId: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
      },
    };

    const mockError = new Error("Bad request");

    await cartMockService.deleteOneProduct.mockRejectedValue(mockError);
    await controller.deleteCartItem(mockRequest as any, mockResponse);

    expect(cartMockService.deleteOneProduct).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });

  test("removeProductFromCart must return a string with product id and cart id", async () => {
    const mockRequest = {
      params: {
        productId: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
        cartId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      },
    };

    const resolvedValue = `Product ${mockRequest.params.productId} from cart ${mockRequest.params.cartId} was deleted`;

    await cartMockService.removeProduct.mockResolvedValue(resolvedValue);
    await controller.removeProductFromCart(mockRequest as any, mockResponse);

    expect(cartMockService.removeProduct).toHaveBeenCalledTimes(1);
    expect(cartMockService.removeProduct).toHaveBeenCalledWith(
      mockRequest.params.productId,
      mockRequest.params.cartId
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(resolvedValue);
  });

  test("removeProductFromCart should handle service errors and call CustomError.handleErrors", async () => {
    const mockRequest = {
      params: {
        cartId: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
        productId: "b7x13b5a-c8df-4405-b607-75a4aa9c557e",
      },
    };

    const mockError = new Error("Bad request");

    await cartMockService.removeProduct.mockRejectedValue(mockError);
    await controller.removeProductFromCart(mockRequest as any, mockResponse);

    expect(cartMockService.removeProduct).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledTimes(1);
    expect(await customErrorSpy).toHaveBeenCalledWith(mockError, mockResponse);
  });
});
