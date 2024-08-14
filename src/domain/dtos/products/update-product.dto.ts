export class UpdateProductDTO {
  constructor(
    public name?: string,
    public category?: string,
    public price?: number,
    public stock?: number,
    public lowStock?: boolean
  ) {}

  static create(obj: { [key: string]: any }): [string?, UpdateProductDTO?] {
    let { name, category, price, stock, lowStock } = obj;

    if (typeof price !== "number") return ["Price must be a number"];
    if (typeof stock !== "number") return ["Stock must be a number"];
    if (typeof name !== "string") return ["Name must be a string"];
    if (typeof category !== "string") return ["Category must be a string"];

    stock < 5 ? (lowStock = true) : (lowStock = false);

    return [
      undefined,
      new UpdateProductDTO(name, category, price, stock, lowStock),
    ];
  }
}
