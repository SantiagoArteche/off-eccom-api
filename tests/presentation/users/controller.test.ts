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

  test("must return an object with params, users and pages", ()=>{
    


  })
});
