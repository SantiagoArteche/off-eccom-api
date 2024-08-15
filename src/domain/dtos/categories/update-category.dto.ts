export class UpdateCategoryDTO {
  constructor(public name?: string, public createdAt?: Date) {}

  static create(obj: { [key: string]: any }): [string?, UpdateCategoryDTO?] {
    let { name, createdAt } = obj;

    if (name && typeof name !== "string") return ["Name must be a string"];
    if (name && name.length < 3)
      return ["Category names must have at least 3 characters"];

    if (!!createdAt === false) {
      createdAt = null;
    } else {
      const currentDate = createdAt;
      createdAt = new Date(currentDate);
      if (createdAt.toString() === "Invalid Date") {
        createdAt = new Date();
      }
    }

    return [undefined, new UpdateCategoryDTO(name, createdAt)];
  }
}
