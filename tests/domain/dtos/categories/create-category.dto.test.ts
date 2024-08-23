import { CreateCategoryDTO } from "../../../../src/domain/dtos";

describe("tests on create-category.dto.ts", () => {
  test("must create a create-category DTO", () => {
    const requestBody = { name: "newCategory", abc: "", red: "" };

    const [error, createCategoryDto] = CreateCategoryDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(createCategoryDto).toHaveProperty("createdAt");
    expect(createCategoryDto).toHaveProperty("name");
    expect(createCategoryDto?.name).toBe(requestBody.name);
    expect(createCategoryDto?.createdAt).toBeInstanceOf(Date);
  });

  test("must throw an error if requestBody not have a name property", () => {
    const requestBody = { abc: "", red: "" };

    const [error, createCategoryDto] = CreateCategoryDTO.create(requestBody);

    expect(error).toBeTruthy();
    expect(error).toBe("Name is required");
  });

  test("must throw an error if name is not a string", () => {
    const requestBody = { abc: "", red: "", name: 3 };

    const [error, createCategoryDto] = CreateCategoryDTO.create(requestBody);

    expect(error).toBeTruthy();
    expect(error).toBe("Name must be a string");
  });

  test("must throw an error if name length is less than 3", () => {
    const requestBody = { abc: "", red: "", name: "ab" };

    const [error, createCategoryDto] = CreateCategoryDTO.create(requestBody);

    expect(error).toBeTruthy();
    expect(error).toBe("Category name must have at least 3 characters");
  });

  test("must assign the current date if createdAt is not valid", () => {
    const requestBody = { name: "abcd", createdAt: "hola" };

    const [error, createCategoryDto] = CreateCategoryDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(createCategoryDto).toHaveProperty("createdAt");
    expect(createCategoryDto).toHaveProperty("name");
    expect(createCategoryDto?.name).toBe(requestBody.name);
    expect(createCategoryDto?.createdAt).toBeInstanceOf(Date);
    expect(createCategoryDto?.createdAt.toString()).toBe(new Date().toString());
  });
});
