import { CreateProductDTO } from "../../../../src/domain/dtos";
describe("tests on create-product.dto.ts", () => {
  test("must return a create-product DTO", () => {
    const requestBody = {
      name: "newProduct",
      price: 30,
      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(createProductDto).toEqual({
      name: "newProduct",
      price: 30,
      stock: 5,
      lowStock: false,
      category: "newCategory",
      createdAt: expect.any(Date),
    });
  });

  test("must return an error if requestBody not have name", () => {
    const requestBody = {
      price: 30,
      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Name is required");
  });

  test("must return an error if name is not string", () => {
    const requestBody = {
      name: 33,
      price: 30,
      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Name must be a string");
  });

  test("must return an error if name length is less than 3", () => {
    const requestBody = {
      name: "33",
      price: 30,
      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Name must have more than 2 characters");
  });

  test("must return an error if requestBody not have price", () => {
    const requestBody = {
      name: "newProd",

      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Price is required");
  });

  test("must return an error if price is not a number", () => {
    const requestBody = {
      name: "newProd",
      price: "333",
      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Price must be a number");
  });

  test("must return an error if price less than 1", () => {
    const requestBody = {
      name: "newProd",
      price: -1,
      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Price must be greater than 0");
  });

  test("must return an error if stock is not a number", () => {
    const requestBody = {
      name: "newProd",
      price: 333,
      stock: "5",
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Stock must be a number");
  });

  test("must assign 0 to stock if stock is falsy", () => {
    const requestBody = {
      name: "newProd",
      price: 333,
      lowStock: "",
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(createProductDto).toBeTruthy();
    expect(createProductDto?.stock).toBe(0);
  });

  test("must assign true to lowStock if stock is < 5", () => {
    const requestBody = {
      name: "newProd",
      price: 333,
      stock: 4,
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(createProductDto).toBeTruthy();
    expect(createProductDto?.lowStock).toBe(true);
  });

  test("must assign false to lowStock if stock is >= 5", () => {
    const requestBody = {
      name: "newProd",
      price: 333,
      stock: 5,
      category: "newCategory",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(createProductDto).toBeTruthy();
    expect(createProductDto?.lowStock).toBe(false);
  });

  test("must return an error if requestBody not have category", () => {
    const requestBody = {
      name: "newProd",
      price: 500,
      stock: 5,
      lowStock: "",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Category is required");
  });

  test("must return an error if category is not a string", () => {
    const requestBody = {
      name: "newProd",
      price: 500,
      stock: 5,
      category: 5,
      lowStock: "",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Category must be a string");
  });

  test("must return an error if category length is less than 3", () => {
    const requestBody = {
      name: "newProd",
      price: 30,
      stock: 5,
      lowStock: "",
      category: "ne",
      createdAt: "",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(createProductDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Category must have more than 2 characters");
  });

  test("must assign the current date if createdAt is not valid", () => {
    const requestBody = {
      name: "newProd",
      price: 30,
      stock: 5,
      lowStock: "",
      category: "newCategory",
      createdAt: "hello",
    };

    const [error, createProductDto] = CreateProductDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(createProductDto).toHaveProperty("createdAt");
    expect(createProductDto?.name).toBe(requestBody.name);
    expect(createProductDto?.createdAt).toBeInstanceOf(Date);
    expect(createProductDto?.createdAt.toString()).toBe(new Date().toString());
  });
});
