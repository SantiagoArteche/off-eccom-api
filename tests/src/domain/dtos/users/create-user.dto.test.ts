import { CreateUserDTO } from "../../../../../src/domain/dtos";


describe("tests on create-user.dto.ts", () => {
  test("must create an create-user DTO", () => {
    const requestBody = {
      email: "user@gmail.com",
      firstName: "Santiago",
      lastName: "Arteche",
      password: "123456",
      age: "25",
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(createUserDto).toBeTruthy();
    expect(createUserDto).toHaveProperty("email");
    expect(createUserDto).toHaveProperty("firstName");
    expect(createUserDto).toHaveProperty("lastName");
    expect(createUserDto).toHaveProperty("password");
    expect(createUserDto).toHaveProperty("age");
    expect(createUserDto).toEqual({
      email: "user@gmail.com",
      firstName: "Santiago",
      lastName: "Arteche",
      password: "123456",
      age: "25",
    });
  });

  test("must return an error if age is not a number", () => {
    const requestBody = {
      email: "user@gmail.com",
      firstName: "Santiago",
      lastName: "Arteche",
      password: "123456",
      age: "25b",
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Age must be a number");
  });

  test("must return an error if requestBody not have age property", () => {
    const requestBody = {
      email: "user@gmail.com",
      firstName: "Santiago",
      lastName: "Arteche",
      password: "123456",
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Age is required");
  });

  test("must return an error if requestBody not have email property", () => {
    const requestBody = {
      firstName: "Santiago",
      lastName: "Arteche",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Email is required");
  });

  test("must return an error if email is not a string", () => {
    const requestBody = {
      firstName: "Santiago",
      lastName: "Arteche",
      email: 3,
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Email must be a string");
  });

  test("must return an error if email not includes @", () => {
    const requestBody = {
      firstName: "Santiago",
      lastName: "Arteche",
      email: "santi.arteche",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Invalid email");
  });

  test("must return an error if email length < 8 or email > 40", () => {
    const requestBody = {
      firstName: "Santiago",
      lastName: "Arteche",
      email: "bac@",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe(
      "Email must have more than 7 and less than characters 40"
    );
  });

  test("must return an error if requestBody not have firstName property", () => {
    const requestBody = {
      email: "san@hotmail.com",
      lastName: "Arteche",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Firstname is required");
  });

  test("must return an error if firstName is not a string", () => {
    const requestBody = {
      email: "san@hotmail.com",
      firstName: 3,
      lastName: "Arteche",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Firstname must be a string");
  });

  test("must return an error if firstName length < 3 or email > 30", () => {
    const requestBody = {
      email: "san@hotmail.com",
      firstName: "sa",
      lastName: "Arteche",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe(
      "Firstname must have more than 2  and less than characters 30"
    );
  });

  test("must return an error if requestBody not have lastName property", () => {
    const requestBody = {
      email: "san@hotmail.com",
      firstName: "Arteche",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Lastname is required");
  });

  test("must return an error if lastName is not a string", () => {
    const requestBody = {
      email: "san@hotmail.com",
      lastName: 3,
      firstName: "Arteche",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Lastname must be a string");
  });

  test("must return an error if lastName length < 3 or email > 30", () => {
    const requestBody = {
      email: "san@hotmail.com",
      firstName: "Santiago",
      lastName: "Ar",
      password: "123456",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe(
      "Lastname must have more than 2  and less than characters 30"
    );
  });

  test("must return an error if requestBody not have password property", () => {
    const requestBody = {
      email: "san@hotmail.com",
      firstName: "Santiago",
      lastName: "Arteche",
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Password is required");
  });

  test("must return an error if password length < 6", () => {
    const requestBody = {
      email: "san@hotmail.com",
      firstName: "Santiago",
      lastName: "Arteche",
      password: 12345,
      age: 3,
    };

    const [error, createUserDto] = CreateUserDTO.create(requestBody);

    expect(createUserDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Password must have at least 6 characters");
  });
});
