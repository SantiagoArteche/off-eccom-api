import { UpdateCategoryDTO } from "../../../../../src/domain/dtos";



describe("tests on update-category.dto.ts", () => {
  test("must create an update-category DTO", () => {
    const requestBody = { name: "newCategory", createdAt: "2024-10-10" };

    const [error, updateCategoryDto] = UpdateCategoryDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateCategoryDto).toHaveProperty("createdAt");
    expect(updateCategoryDto).toHaveProperty("name");
    expect(updateCategoryDto?.name).toBe(requestBody.name);
    expect(updateCategoryDto?.createdAt).toBeInstanceOf(Date);
  });

  test("must return a null createdAt if createdAt is not in requestBody", () => {
    const requestBody = { name: "newCategory" };

    const [error, updateCategoryDto] = UpdateCategoryDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateCategoryDto).toHaveProperty("createdAt");
    expect(updateCategoryDto).toHaveProperty("name");
    expect(updateCategoryDto?.name).toBe(requestBody.name);
    expect(updateCategoryDto?.createdAt).toBe(null);
  });

  test("must return a object with name and createdAt properties which have falsy values if the request body not have name and createdAt", () => {
    const requestBody = { abc: "", red: "" };

    const [error, updateCategoryDto] = UpdateCategoryDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateCategoryDto).toHaveProperty("createdAt");
    expect(updateCategoryDto).toHaveProperty("name");
    expect(updateCategoryDto?.name).toBeFalsy();
    expect(updateCategoryDto?.createdAt).toBeFalsy();
  });

  test("must throw an error if name is not a string", () => {
    const requestBody = { abc: "", red: "", name: 3 };

    const [error, updateCategoryDto] = UpdateCategoryDTO.create(requestBody);

    expect(updateCategoryDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Name must be a string");
  });

  test("must throw an error if name length is less than 3", () => {
    const requestBody = { name: "ab" };

    const [error, updateCategoryDto] = UpdateCategoryDTO.create(requestBody);

    expect(updateCategoryDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Category name must have at least 3 characters");
  });

  test("must assign the current date if createdAt is in requestBody but is not valid", () => {
    const requestBody = { name: "abcd", createdAt: "hola" };

    const [error, updateCategoryDto] = UpdateCategoryDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(updateCategoryDto).toHaveProperty("createdAt");
    expect(updateCategoryDto).toHaveProperty("name");
    expect(updateCategoryDto?.name).toBe(requestBody.name);
    expect(updateCategoryDto?.createdAt).toBeInstanceOf(Date);
    expect(updateCategoryDto?.createdAt?.toString()).toBe(
      new Date().toString()
    );
  });
});
