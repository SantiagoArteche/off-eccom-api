export class CreateCartItemDTO {
  constructor(public quantity: number) {}

  static create(obj: { [key: string]: any }): [string?, CreateCartItemDTO?] {
    let { quantity } = obj;

    if (!quantity || +quantity < 1) quantity = 1;
    if (typeof +quantity !== "number") return ["Quantity must be a number"];

    return [undefined, new CreateCartItemDTO(+quantity)];
  }
}
