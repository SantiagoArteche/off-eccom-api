import { PaginationDTO } from "../../../../../src/domain/dtos";


describe("tests on pagination.dto.ts", () => {
  test("must return a pagination DTO", () => {
    const requestQuery = { page: 3, limit: 4 };

    const [error, paginationDto] = PaginationDTO.create(
      requestQuery.page,
      requestQuery.limit
    );

    expect(error).toBeFalsy();
    expect(paginationDto).toHaveProperty("page");
    expect(paginationDto).toHaveProperty("limit");
    expect(typeof paginationDto?.limit).toBe("number");
    expect(typeof paginationDto?.page).toBe("number");
    expect(paginationDto?.limit).toBe(requestQuery.limit);
    expect(paginationDto?.page).toBe(requestQuery.page);
  });

  test("must throw an error if one of the parameters is a string", () => {
    const requestQuery = { page: "b", limit: 4 };
    const requestQueryB = { page: 4, limit: "b" };

    const [error, paginationDto] = PaginationDTO.create(
      +requestQuery.page,
      +requestQuery.limit
    );

    const [errorB, paginationDtoB] = PaginationDTO.create(
      +requestQueryB.page,
      +requestQueryB.limit
    );

    expect(paginationDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Page and limit must be numbers");

    expect(paginationDtoB).toBeFalsy();
    expect(errorB).toBeTruthy();
    expect(errorB).toBe("Page and limit must be numbers");
  });

  test("must throw an error if page or limit are lesser than 0", () => {
    const requestQuery = { page: 4, limit: -1 };
    const requestQueryB = { page: -1, limit: 4 };

    const [error, paginationDto] = PaginationDTO.create(
      +requestQuery.page,
      +requestQuery.limit
    );

    const [errorB, paginationDtoB] = PaginationDTO.create(
      +requestQueryB.page,
      +requestQueryB.limit
    );

    expect(paginationDto).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toBe("Page and limit must be greater than 0");

    expect(paginationDtoB).toBeFalsy();
    expect(errorB).toBeTruthy();
    expect(errorB).toBe("Page and limit must be greater than 0");
  });
});
