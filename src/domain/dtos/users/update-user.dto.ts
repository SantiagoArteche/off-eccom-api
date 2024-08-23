export class UpdateUserDTO {
  constructor(
    public email?: string,
    public firstName?: string,
    public lastName?: string,
    public password?: string,
    public age?: number
  ) {}

  static create(obj: { [key: string]: any }): [string?, UpdateUserDTO?] {
    const { email, firstName, lastName, password, age } = obj;

    if (age && isNaN(age)) return ["Age must be a number"];

    if (email && typeof email !== "string") return ["Email must be a string"];
    if (email && !email.includes("@")) return ["Invalid email"];
    if (email && (email.length < 8 || email.length > 40))
      return ["Email must have more than 7 and less than characters 40"];

    if (firstName && typeof firstName !== "string")
      return ["Firstname must be a string"];
    if (firstName && (firstName.length < 3 || firstName.length > 30))
      return ["Firstname must have more than 2 and less than characters 30"];

    if (lastName && typeof lastName !== "string")
      return ["Lastname must be a string"];
    if (lastName && (lastName.length < 3 || lastName.length > 30))
      return ["Lastname must have more than 2 and less than characters 30"];

    if (password && password.toString().length < 6)
      return ["Password must have at least 6 characters"];

    return [
      undefined,
      new UpdateUserDTO(
        email,
        firstName,
        lastName,
        password && password.toString(),
        age
      ),
    ];
  }
}
