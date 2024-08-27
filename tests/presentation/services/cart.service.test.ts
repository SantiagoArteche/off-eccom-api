import { Bcrypt } from "../../../src/config";
import { prisma } from "../../../src/data/postgres/init";
import { CartService } from "../../../src/presentation/services/cart.service";

export const CartTest = describe("tests on cart.service.ts", () => {
  let service: CartService;
  let user: any;
  let cart: any;
  let product: any;
  let productB: any;

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        email: "usertesting@hotmail.com",
        password: Bcrypt.hashPassword("123456"),
        age: 22,
        firstName: "user",
        lastName: "test",
        isValidated: false,
      },
    });
    cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });
    await prisma.category.create({
      data: {
        name: "shoes",
      },
    });
    product = await prisma.products.create({
      data: {
        name: "newProduct",
        category: "shoes",
        price: 300,
        stock: 300,
        lowStock: false,
      },
    });
    productB = await prisma.products.create({
      data: {
        name: "newProductB",
        category: "shoes",
        price: 300,
        stock: 0,
        lowStock: false,
      },
    });

    service = new CartService();
  });

  afterEach(async () => {
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.category.deleteMany({});
  });

  test("must create an instance of cart service", () => {
    expect(service).toHaveProperty("getCarts");
    expect(service).toHaveProperty("addProductToCart");
    expect(service).toHaveProperty("getCartById");
    expect(service).toHaveProperty("createCart");
    expect(service).toHaveProperty("deleteCart");
    expect(service).toHaveProperty("removeProduct");
    expect(service).toHaveProperty("deleteOneProduct");
    expect(typeof service.addProductToCart).toBe("function");
    expect(typeof service.createCart).toBe("function");
    expect(typeof service.deleteCart).toBe("function");
    expect(typeof service.deleteOneProduct).toBe("function");
    expect(typeof service.getCartById).toBe("function");
    expect(typeof service.getCarts).toBe("function");
    expect(typeof service.removeProduct).toBe("function");
  });

  test("getCarts must return an object with page, limit, prev , next, totalCarts and allCarts", async () => {
    const mockObject = { page: 1, limit: 10 };

    try {
      const getCarts = await service.getCarts(mockObject);

      expect(getCarts).toEqual({
        allCarts: [
          {
            cartItemId: [],
            id: expect.any(String),
            placeOrder: false,
            subtotal: 0,
            tax: 0,
            total: 0,
            userId: expect.any(String),
          },
        ],
        currentPage: 1,
        limit: 10,
        next: "/api/cart?page=2&limit=10",
        prev: null,
        totalCarts: expect.any(Number),
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getCarts must return an error if page or limit are wrong values", async () => {
    const mockObject = { page: 1, limit: "b" };

    try {
      await service.getCarts(mockObject as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided.");
    }
  });

  test("getCartById must return an object with the cart", async () => {
    try {
      const cart = await prisma.cart.findUnique({
        where: {
          userId: user.id,
        },
      });

      const getCarts = await service.getCartById(cart?.id as any);

      expect(getCarts).toEqual({
        cart: {
          cartItemId: [],
          id: cart?.id,
          placeOrder: false,
          subtotal: 0,
          tax: 0,
          total: 0,
          userId: user.id,
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getCartById must throw an error if cart is not found", async () => {
    try {
      await service.getCartById("a6c02b5a-c8df-4405-b607-75a4aa9c557e");
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Cart not found");
    }
  });

  test("getCartById must throw an error if ID is invalid", async () => {
    try {
      await service.getCartById({} as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("addProductToCart must return a msg and the cart updated", async () => {
    const mockCartItem = {
      quantity: 2,
      cartId: cart.id,
      productId: product.id,
    };

    try {
      const addProd = await service.addProductToCart(
        product.id,
        cart?.id as any,
        mockCartItem
      );

      expect(addProd).toBeTruthy();
      expect(addProd).toEqual({
        msg: "Cart Updated",
        updatedCart: {
          cartItemId: [expect.any(String)],
          id: cart.id,
          placeOrder: false,
          subtotal: expect.any(Number),
          tax: expect.any(Number),
          total: expect.any(Number),
          userId: user.id,
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("addProductToCart must return an error if cart or product not found", async () => {
    const mockCartItem = {
      quantity: 2,
      cartId: cart.id,
      productId: product.id,
    };

    try {
      await service.addProductToCart(product.id, "123123", mockCartItem);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Product or cart not found");
    }
  });

  test("addProductToCart must return an error if wrong values are provided", async () => {
    try {
      await service.addProductToCart(product.id, cart.id, {} as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Argument `quantity` is missing");
    }
  });

  test("addProductToCart must return an error if product don't have enough stock", async () => {
    const mockCartItem = {
      quantity: 12312321,
      cartId: cart.id,
      productId: product.id,
    };

    try {
      await service.addProductToCart(product.id, cart.id, mockCartItem as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain(
        `Error: We only have ${product.stock} units of newProduct, change your quantity!`
      );
    }
  });

  test("addProductToCart must return an error if product is out of stock", async () => {
    const mockCartItem = {
      quantity: 12312321,
      cartId: cart.id,
      productId: productB.id,
    };

    try {
      await service.addProductToCart(productB.id, cart.id, mockCartItem as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Product out of stock");
    }
  });

  test("createCart must return a msg and the cart created", async () => {
    try {
      const newUser = await prisma.user.create({
        data: {
          email: "testing@hotmail.com",
          password: Bcrypt.hashPassword("123456"),
          age: 22,
          firstName: "user",
          lastName: "test",
          isValidated: false,
        },
      });

      const newCart = await service.createCart(newUser.id);

      expect(newCart).toBeTruthy();
      expect(newCart).toEqual({
        cart: {
          cartItemId: [],
          id: expect.any(String),
          placeOrder: false,
          subtotal: 0,
          tax: 0,
          total: 0,
          userId: expect.any(String),
        },
        msg: "Cart created!",
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("createCart must return an error if user already have a cart", async () => {
    try {
      await service.createCart(user.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: An user can create only one cart");
    }
  });

  test("createCart must return an error if user is not found", async () => {
    const id = "a6c02b5a-c8df-4405-b607-75a4aa9c557e";
    try {
      await service.createCart(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        `Error: User with id ${id} not found, to create a cart you need an user`
      );
    }
  });

  test("createCart must return an error if wrong values are provided", async () => {
    const id = 55;
    try {
      await service.createCart(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("deleteCart must return a msg with the id of the cart deleted", async () => {
    try {
      const deleteCart = await service.deleteCart(cart.id);

      expect(deleteCart).toBeTruthy();
      expect(deleteCart).toBe(`Cart with id ${cart.id} was deleted`);
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("deleteCart must return an error if cart not found", async () => {
    const id = "a6c02b5a-c8df-4405-b607-75a4aa9c557e";

    try {
      await service.deleteCart(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Cart not found");
    }
  });

  test("deleteCart must return an error if wrong values are provided", async () => {
    const id = 33;

    try {
      await service.deleteCart(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("deleteOneProduct must return a string with the product id reduced and the cart id updated", async () => {
    const mockCartItem = {
      quantity: 2,
      cartId: cart.id,
      productId: product.id,
    };

    try {
      await service.addProductToCart(product.id, cart?.id as any, mockCartItem);

      const deleteOneProduct = await service.deleteOneProduct(
        product.id,
        cart.id
      );

      expect(deleteOneProduct).toBeTruthy();
      expect(deleteOneProduct).toBe(
        `Quantity on product ${product.id} from cart ${cart.id} was updated`
      );
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("deleteOneProduct must return an error if product or cart are not found", async () => {
    try {
      await service.deleteOneProduct("abc", cart.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Product or cart not found");
    }
  });
  test("deleteOneProduct must return an error if product is not found in cart", async () => {
    try {
      await service.deleteOneProduct(product.id, cart.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Product in cart not found");
    }
  });

  test("deleteOneProduct must return an error if wrong values are provided", async () => {
    try {
      await service.deleteOneProduct(4141 as any, 31313 as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("removeProduct must return a string with the product id removed and the cart id updated", async () => {
    const mockCartItem = {
      quantity: 2,
      cartId: cart.id,
      productId: product.id,
    };

    try {
      await service.addProductToCart(product.id, cart?.id as any, mockCartItem);

      const removeProduct = await service.removeProduct(product.id, cart.id);

      expect(removeProduct).toBeTruthy();
      expect(removeProduct).toBe(
        `Product ${product.id} from cart ${cart.id} was deleted`
      );
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("removeProduct must fail if product or cart not found", async () => {
    const cartId = "a6c02b5a-c8df-4405-b607-75a4aa9c557e";

    try {
      await service.removeProduct(product.id, cartId);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Product or cart not found");
    }
  });

  test("removeProduct must fail if product is not found in cart", async () => {
    try {
      await service.removeProduct(product.id, cart.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Product in cart not found");
    }
  });

  test("removeProduct must fail if wrong values are provided", async () => {
    try {
      await service.removeProduct(55 as any, 33 as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });
});
