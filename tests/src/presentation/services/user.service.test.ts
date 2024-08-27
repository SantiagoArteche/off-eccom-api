import { Bcrypt } from "../../../../src/config";
import { prisma } from "../../../../src/data/postgres/init";
import { UserService } from "../../../../src/presentation/services/user.service";
export const UserTest = describe("tests on user.service.ts", () => {
  let service: UserService;

  let user: any;
  let userb: any;

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        email: "usertest@hotmail.com",
        password: Bcrypt.hashPassword("123456"),
        age: 22,
        firstName: "user",
        lastName: "test",
        isValidated: false,
      },
    });

    userb = await prisma.user.create({
      data: {
        email: "usertestb@hotmail.com",
        password: Bcrypt.hashPassword("123456"),
        age: 22,
        firstName: "user",
        lastName: "test",
        isValidated: true,
      },
    });

    service = new UserService();
  });

  afterEach(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.products.deleteMany();
    await prisma.category.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.user.deleteMany();
  });

  test("must return an user service instance", () => {
    expect(service).toBeInstanceOf(UserService);
    expect(service).toHaveProperty("getAll");
    expect(service).toHaveProperty("getById");
    expect(service).toHaveProperty("create");
    expect(service).toHaveProperty("update");
    expect(service).toHaveProperty("delete");
    expect(service).toHaveProperty("reSendValidationMail");
    expect(service).toHaveProperty("sendValidationMail");
    expect(typeof service.create).toBe("function");
    expect(typeof service.delete).toBe("function");
    expect(typeof service.getAll).toBe("function");
    expect(typeof service.getById).toBe("function");
    expect(typeof service.reSendValidationMail).toBe("function");
    expect(typeof service.update).toBe("function");
  });

  test("getAll must return an object with page, limit, prev , next, totalUsers and users ", async () => {
    const mockObject = { page: 1, limit: 10 };

    try {
      const users = await service.getAll(mockObject);

      expect(users).toBeTruthy();
      expect(users).toEqual({
        currentPage: 1,
        limit: 10,
        next: "/api/users?page=2&limit=10",
        prev: null,
        totalUsers: 2,
        users: [
          {
            id: expect.any(String),
            age: expect.any(Number),
            email: expect.any(String),
            firstName: expect.any(String),
            isValidated: expect.any(Boolean),
            lastName: expect.any(String),
          },
          {
            id: expect.any(String),
            age: expect.any(Number),
            email: expect.any(String),
            firstName: expect.any(String),
            isValidated: expect.any(Boolean),
            lastName: expect.any(String),
          },
        ],
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getAll must fail if wrong values are provided ", async () => {
    const mockObject = { page: 1, limit: "bb" };

    try {
      await service.getAll(mockObject as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("getById must return the user found", async () => {
    try {
      const userById = await service.getById(user.id);
      expect(userById).toBeTruthy();
      expect(userById).toEqual({
        user: {
          age: 22,
          email: "usertest@hotmail.com",
          firstName: "user",
          id: expect.any(String),
          isValidated: expect.any(Boolean),
          lastName: "test",
          role: "user",
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getById must throw an error if user not found", async () => {
    const id = "28x4ddf0-6e1d-48b0-a378-78dc459e4b73";
    try {
      await service.getById(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(`Error: User with id ${id} not found`);
    }
  });

  test("getById must fail if wrong values are provided", async () => {
    const id = 123213;
    try {
      await service.getById(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("create must return an object with a msg and the new user", async () => {
    const mockObject = {
      age: 33,
      email: "test@test.com",
      firstName: "Santiago",
      lastName: "Arteche",
    };

    try {
      const newUser = await service.create({
        ...mockObject,
        password: Bcrypt.hashPassword("123456"),
      });
      expect(newUser).toBeTruthy();
      expect(newUser).toEqual({
        msg: "User Created",
        user: {
          ...mockObject,
          role: "user",
          id: expect.any(String),
          isValidated: false,
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("create must return an error if email is already in use", async () => {
    try {
      await service.create({
        email: "usertest@hotmail.com",
        password: Bcrypt.hashPassword("123456"),
        age: 22,
        firstName: "user",
        lastName: "test",
      });
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Email already in use");
    }
  });

  test("create must return fail if wrong values are provided", async () => {
    try {
      await service.create({
        email: "usertest@hotmail.com",
        password: Bcrypt.hashPassword("123456"),
        age: "santiago" as any,
        firstName: "user",
        lastName: "test",
      });
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("update must return an object with msg and the user updated", async () => {
    const mockObject = {
      updateUserDto: { age: 44 },
      id: user.id,
    };

    try {
      const updateUser = await service.update(
        mockObject.updateUserDto,
        mockObject.id
      );

      expect(updateUser).toBeTruthy();
      expect(updateUser).toEqual({
        msg: "User Updated",
        user: {
          age: 44,
          email: "usertest@hotmail.com",
          firstName: "user",
          id: expect.any(String),
          isValidated: expect.any(Boolean),
          lastName: "test",
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("update must return an error if user not found", async () => {
    const mockObject = {
      updateUserDto: { age: 44 },
      id: "28x4ddf0-6e1d-48b0-a378-78dc459e4b73",
    };

    try {
      await service.update(mockObject.updateUserDto, mockObject.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        `Error: User with id ${mockObject.id} not found`
      );
    }
  });

  test("update must return an error if email is already in use", async () => {
    const mockObject = {
      updateUserDto: { age: 44, email: "usertestb@hotmail.com" },
      id: user.id,
    };

    try {
      await service.update(mockObject.updateUserDto, mockObject.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Email already in use");
    }
  });

  test("update must fail if wrong values are provided", async () => {
    const mockObject = {
      updateUserDto: {
        age: "usertestb@hotmail.com",
        email: "usertestb@hotmail.com",
      },
      id: user.id,
    };

    try {
      await service.update(mockObject.updateUserDto as any, mockObject.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("delete must return a string with the user id deleted", async () => {
    try {
      const deleteUser = await service.delete(user.id);
      expect(deleteUser).toBeTruthy();
      expect(deleteUser).toBe(`User with id ${user.id} was deleted`);
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("delete must delete the user cart and return a string with the user id deleted", async () => {
    try {
      const cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
      const deleteUser = await service.delete(cart.userId);
      expect(deleteUser).toBeTruthy();
      expect(deleteUser).toBe(`User with id ${cart.userId} was deleted`);
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("delete must delete the user cart, cart item and return a string with the user id deleted", async () => {
    try {
      const cart = await prisma.cart.create({
        data: {
          userId: userb.id,
        },
      });
      await prisma.category.create({
        data: {
          name: "newCategory",
        },
      });
      const product = await prisma.products.create({
        data: {
          category: "newCategory",
          name: "newProd",
          price: 333,
          stock: 122,
          lowStock: false,
        },
      });
      await prisma.cartItem.create({
        data: {
          quantity: 3,
          cartId: cart.id,
          productId: product.id,
        },
      });

      const deleteUser = await service.delete(cart.userId);
      expect(deleteUser).toBeTruthy();
      expect(deleteUser).toBe(`User with id ${cart.userId} was deleted`);
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("delete must return an error if user not found", async () => {
    const id = "28x4ddf0-6e1d-48b0-a378-78dc459e4b73";
    try {
      const deleteUser = await service.delete(id);
      expect(deleteUser).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(`Error: User with id ${id} not found`);
    }
  });

  test("delete must fail if wrong values are provided", async () => {
    const id = 3333;
    try {
      await service.delete(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("reSendValidationMail must return a string with the user email", async () => {
    try {
      const reSend = await service.reSendValidationMail(user.id);
      expect(reSend).toBeTruthy();
      expect(reSend).toBe("Email resend to usertest@hotmail.com");
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("reSendValidationMail must return an error if user not found", async () => {
    const id = "28x4ddf0-6e1d-48b0-a378-78dc459e4b73";
    try {
      const deleteUser = await service.reSendValidationMail(id);
      expect(deleteUser).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(`Error: User with id ${id} not found`);
    }
  });

  test("reSendValidationMail must return an error if user is already validated", async () => {
    try {
      const deleteUser = await service.reSendValidationMail(userb.id);
      expect(deleteUser).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: User already validated");
    }
  });

  test("reSendValidationMail must fail if wrong values are provided", async () => {
    const id = 3333;
    try {
      await service.reSendValidationMail(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });
});
