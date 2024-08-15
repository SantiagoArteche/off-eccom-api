export class UpdateProductDTO {
  constructor(
    public name?: string,
    public category?: string,
    public price?: number,
    public stock?: number,
    public lowStock?: boolean,
    public createdAt?: Date
  ) {}

  static create(obj: { [key: string]: any }): [string?, UpdateProductDTO?] {
    let { name, category, price, stock, lowStock, createdAt } = obj;

    if (price && typeof price !== "number") return ["Price must be a number"];
    if (stock && typeof stock !== "number") return ["Stock must be a number"];
    if (name && typeof name !== "string") return ["Name must be a string"];
    if (category && typeof category !== "string")
      return ["Category must be a string"];

    if (name && name.length < 3)
      return ["Name must have more than 2 character"];
    if (category && category.length < 3)
      return ["Category must have more than 2 character"];

    stock < 5 ? (lowStock = true) : (lowStock = false);

    if (!!createdAt === false) {
      createdAt = null;
    } else {
      const currentDate = createdAt;
      createdAt = new Date(currentDate);
      if (createdAt.toString() === "Invalid Date") {
        createdAt = new Date();
      }
    }

    return [
      undefined,
      new UpdateProductDTO(name, category, price, stock, lowStock, createdAt),
    ];
  }
}
