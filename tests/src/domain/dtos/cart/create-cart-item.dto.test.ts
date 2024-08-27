import { CreateCartItemDTO } from "../../../../../src/domain/dtos";



describe("tests on create-cart-item.dto.ts", () => {
  test("must create a create-cart-item DTO", () => {
    const requestBody = {
      quantity: 5,
      numbers: [],
      name: "Santiago",
    };

    const [error, cartItemDto] = CreateCartItemDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(cartItemDto).toHaveProperty("quantity");
    expect(cartItemDto?.quantity).toBe(requestBody.quantity);
  });

  test("must assign 1 to quantity if property quantity not exists in request body", () => {
    const requestBody = {
      numbers: [],
      name: "Santiago",
    };

    const [error, cartItemDto] = CreateCartItemDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(cartItemDto).toHaveProperty("quantity");
    expect(cartItemDto?.quantity).toBe(1);
  });

  test("must assign 1 to quantity if property quantity is less than 1", () => {
    const requestBody = {
      quantity: -20,
    };

    const [error, cartItemDto] = CreateCartItemDTO.create(requestBody);

    expect(error).toBeFalsy();
    expect(cartItemDto).toHaveProperty("quantity");
    expect(cartItemDto?.quantity).toBe(1);
  });

  test("must throw an error if quantity is not a number", () => {
    const requestBody = {
      quantity: "santiago",
    };

    const [error, cartItemDto] = CreateCartItemDTO.create(requestBody);

    expect(error).toBeTruthy();
    expect(cartItemDto).toBeFalsy();
    expect(error).toBe("Quantity must be a number");
  });
});
