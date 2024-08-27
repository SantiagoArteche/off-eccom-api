
import { Bcrypt } from "../../../../src/config";
import { prisma } from "../../../../src/data/postgres/init";
import { AuthService } from "../../../../src/presentation/services/auth.service";


export const AuthTest = describe("tests on auth.services.ts", () => {
  let service = new AuthService();

  beforeEach(async () => {
    await prisma.user.create({
      data: {
        email: "usertest@hotmail.com",
        password: Bcrypt.hashPassword("123456"),
        age: 22,
        firstName: "user",
        lastName: "test",
        isValidated: true,
      },
    });
    await prisma.user.create({
      data: {
        email: "usertestb@hotmail.com",
        password: Bcrypt.hashPassword("123456"),
        age: 22,
        firstName: "user",
        lastName: "test",
        isValidated: false,
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test("must return an instance of auth service", () => {
    expect(service).toHaveProperty("login");
    expect(service).toHaveProperty("validate");
    expect(service).toHaveProperty("validateLogin");
    expect(typeof service.login).toBe("function");
    expect(typeof service.validate).toBe("function");
    expect(typeof service.validateLogin).toBe("function");
  });

  test("login must return an object with an user and a token", async () => {
    const user = {
      email: "usertest@hotmail.com",
      password: "123456",
    };

    const login = await service.login(user.email, user.password);
    expect(login).toBeTruthy();
    expect(login).toEqual({
      user: {
        id: expect.any(String),
        email: "usertest@hotmail.com",
        age: 22,
        firstName: "user",
        lastName: "test",
        isValidated: true,
      },
      token: expect.any(String),
    });
  });

  test("login must fail if user email or password is incorrect", async () => {
    const user = {
      email: "usertest@hotmail.combbb",
      password: "123456",
    };

    try {
      await service.login(user.email, user.password);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toEqual("Error: Wrong credentials");
    }
  });

  test("login must fail if user email or password is incorrect", async () => {
    const user = {
      email: "usertest@hotmail.com",
      password: "123456x",
    };

    try {
      await service.login(user.email, user.password);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toEqual("Error: Wrong credentials");
    }
  });

  test("validateLogin must return a string with the email of the user logged", async () => {
    const user = {
      email: "usertest@hotmail.com",
      password: "123456",
    };

    const userLogged = await service.login(user.email, user.password);
    const validateLogin = await service.validateLogin(
      `access_token=${userLogged.token}`
    );

    expect(validateLogin).toBeTruthy();
    expect(validateLogin).toEqual(`User with email ${user.email} logged`);
  });

  test("validateLogin must fail if cookie is missing or invalid", async () => {
    const user = {
      email: "usertest@hotmail.com",
      password: "123456",
    };

    const userLogged = await service.login(user.email, user.password);
    try {
      await service.validateLogin(userLogged.token as string);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toEqual(
        "Error: JsonWebTokenError: jwt must be provided"
      );
    }
  });

  test("validateLogin must fail if user is not validated", async () => {
    const user = {
      email: "usertestb@hotmail.com",
      password: "123456",
    };

    try {
      const userLogged = await service.login(user.email, user.password);
      await service.validateLogin(`access_token=${userLogged.token}`);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: User not validated");
    }
  });

  test("validate must return a string with the email of the user validated", async () => {
    const user = {
      email: "usertestb@hotmail.com",
      password: "123456",
    };

    const userLogged = await service.login(user.email, user.password);
    const validateUser = await service.validate(`${userLogged.token}`);

    expect(validateUser).toBeTruthy();
    expect(validateUser).toEqual(`User with email ${user.email} validated`);
  });

  test("validate must fail if user is already validated", async () => {
    const user = {
      email: "usertest@hotmail.com",
      password: "123456",
    };

    try {
      const userLogged = await service.login(user.email, user.password);
      await service.validate(`${userLogged.token}`);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toEqual(`Error: User already validated`);
    }
  });
});
