export class CreateProductDTO {
  constructor(
    public name: string,
    public price: number,
    public stock: number,
    public category: string,
    public createdAt: Date,
    public lowStock: boolean
  ) {}

  static create(obj: { [key: string]: any }): [string?, CreateProductDTO?] {
    let { name, price, stock, lowStock, category, createdAt } = obj;

    if (!name) return ["Name is required"];
    if (typeof name !== "string") return ["Name must be a string"];
    if (name.length < 3) return ["Name must have more than 2 characters"];

    if (!price) return ["Price is required"];
    if (typeof price !== "number") return ["Price must be a number"];

    if (!stock) stock = 0;
    if (typeof stock !== "number") return ["Stock must be a number"];
    stock < 5 ? (lowStock = true) : (lowStock = false);

    if (!category) return ["Category is required"];
    if (typeof category !== "string") return ["Category must be a string"];
    if (category.length < 3)
      return ["Category must have more than 2 characters"];

    if (!!createdAt === false) {
      createdAt = new Date();
    } else {
      const currentDate = createdAt;
      createdAt = new Date(currentDate);
      if (createdAt.toString() === "Invalid Date") {
        createdAt = new Date();
      }
    }

    return [
      undefined,
      new CreateProductDTO(name, price, stock, category, createdAt, lowStock),
    ];
  }
}
