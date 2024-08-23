import { UpdateUserDTO } from "../../../../src/domain/dtos/users/update-user.dto";
describe("tests on update-user.dto.ts", () => {
  test("must create an update-user DTO", () => {
    const requestBody = {
      email: "user@gmail.com",
      firstName: "Santiago",
      lastName: "Arteche",
      password: "123456",
      age: "25",
    };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateUserDto).toBeTruthy();
    expect(updateUserDto).toHaveProperty("email");
    expect(updateUserDto).toHaveProperty("firstName");
    expect(updateUserDto).toHaveProperty("lastName");
    expect(updateUserDto).toHaveProperty("password");
    expect(updateUserDto).toHaveProperty("age");
    expect(updateUserDto).toEqual({
      email: "user@gmail.com",
      firstName: "Santiago",
      lastName: "Arteche",
      password: "123456",
      age: "25",
    });
  });

  test("must return an object with properties which have falsy values if the request body not have properties", () => {
    const requestBody = {};

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateUserDto).toEqual({
      age: undefined,
      email: undefined,
      firstName: undefined,
      lastName: undefined,
      password: undefined,
    });
  });

  test("must return an error if age is not a number", () => {
    const requestBody = { age: "beb" };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Age must be a number");
  });

  test("must return an error if email is not a string", () => {
    const requestBody = { email: 33 };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Email must be a string");
  });

  test("must return an error if email length < 8 or > 40", () => {
    const requestBody = { email: "a@a.com" };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe(
      "Email must have more than 7 and less than characters 40"
    );
  });

  test("must return an error if email is not includes @", () => {
    const requestBody = { email: "santihotmail.com" };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Invalid email");
  });

  test("must return an error if firstName is not a string", () => {
    const requestBody = { firstName: 33 };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Firstname must be a string");
  });

  test("must return an error if firstName length < 2 or > 30", () => {
    const requestBody = { firstName: "Sa" };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe(
      "Firstname must have more than 2 and less than characters 30"
    );
  });

  test("must return an error if lastName is not a string", () => {
    const requestBody = { lastName: 33 };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Lastname must be a string");
  });

  test("must return an error if lastName length < 2 or > 30", () => {
    const requestBody = { lastName: "Sa" };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe(
      "Lastname must have more than 2 and less than characters 30"
    );
  });

  test("must return an error if password length < 6", () => {
    const requestBody = { password: 12345 };

    const [error, updateUserDto] = UpdateUserDTO.create(requestBody);

    expect(updateUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Password must have at least 6 characters");
  });
});
