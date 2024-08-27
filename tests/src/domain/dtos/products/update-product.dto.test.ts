import { UpdateProductDTO } from "../../../../../src/domain/dtos";

describe("tests on create-product.dto.ts", () => {
  test("must return a update-product DTO", () => {
    const requestBody = {
      name: "newProduct",
      price: 30,
      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateProductDto).toEqual({
      name: "newProduct",
      price: 30,
      stock: 5,
      lowStock: false,
      category: "newCategory",
      createdAt: updateProductDto?.createdAt ? expect.any(Date) : null,
    });
  });

  test("must return an object with properties which have falsy values if the request body not have properties", () => {
    const requestBody = {};

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateProductDto).toEqual({
      name: undefined,
      category: undefined,
      price: undefined,
      stock: undefined,
      lowStock: null,
      createdAt: null,
    });
  });

  test("must return an error if price is not a number", () => {
    const requestBody = {
      price: "notANumber",
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(updateProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Price must be a number");
  });

  test("must return an error if stock is not a number", () => {
    const requestBody = {
      stock: "notANumber",
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(updateProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Stock must be a number");
  });

  test("must return an error if name is not a string", () => {
    const requestBody = {
      name: 555,
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(updateProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Name must be a string");
  });

  test("must return an error if category is not a string", () => {
    const requestBody = {
      category: 555,
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(updateProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Category must be a string");
  });

  test("must return an error if name length is less than 3", () => {
    const requestBody = {
      name: "ne",
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(updateProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Name must have more than 2 character");
  });

  test("must return an error if category length is less than 3", () => {
    const requestBody = {
      category: "ne",
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(updateProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Category must have more than 2 character");
  });

  test("must assign true to lowStock if stock is < 5", () => {
    const requestBody = {
      stock: 4,
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateProductDto).toBeTruthy();
    expect(updateProductDto?.lowStock).toBe(true);
  });

  test("must assign false to lowStock if stock is >= 5", () => {
    const requestBody = {
      stock: 5,
    };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateProductDto).toBeTruthy();
    expect(updateProductDto?.lowStock).toBe(false);
  });

  test("must assign the current date if createdAt is in requestBody but is not valid", () => {
    const requestBody = { createdAt: "hola" };

    const [error, updateProductDto] = UpdateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateProductDto).toHaveProperty("createdAt");
    expect(updateProductDto).toHaveProperty("name");
    expect(updateProductDto?.createdAt).toBeInstanceOf(Date);
    expect(updateProductDto?.createdAt?.toString()).toBe(new Date().toString());
  });
});
