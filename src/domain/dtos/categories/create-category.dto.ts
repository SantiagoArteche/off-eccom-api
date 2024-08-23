export class CreateCategoryDTO {
  constructor(public name: string, public createdAt: Date) {}

  static create(obj: { [key: string]: any }): [string?, CreateCategoryDTO?] {
    let { name, createdAt } = obj;

    if (!name) return ["Name is required"];
    if (typeof name !== "string") return ["Name must be a string"];
    if (name.length < 3)
      return ["Category name must have at least 3 characters"];

    if (!!createdAt === false) {
      createdAt = new Date();
    } else {
      const currentDate = createdAt;
      createdAt = new Date(currentDate);
      if (createdAt.toString() === "Invalid Date") {
        createdAt = new Date();
      }
    }

    return [undefined, new CreateCategoryDTO(name, createdAt)];
  }
}
