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

    if (age && isNaN(age)) return ["Age should be a number"];

    if (email && !email.includes("@")) return ["Invalid email"];
    if ((email && email.length < 8) || email.length > 40)
      return ["Email must have more than 7 and less than characters 40"];

    if (firstName && (firstName.length < 4 || firstName.length > 30))
      return ["Firstname must have more than 3  and less than characters 30"];

    if (lastName && (lastName.length < 4 || lastName.length > 30))
      return ["Lastname must have more than 3  and less than characters 30"];

    if (password && password.toString().length < 6)
      return ["Password must have at least 6 characters"];

    return [
      undefined,
      new UpdateUserDTO(email, firstName, lastName, password.toString(), age),
    ];
  }
}
