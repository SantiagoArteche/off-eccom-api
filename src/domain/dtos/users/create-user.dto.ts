export class CreateUserDTO {
  constructor(
    public email: string,
    public firstName: string,
    public lastName: string,
    public password: string,
    public age: number
  ) {}

  static create(props: { [key: string]: any }): [string?, CreateUserDTO?] {
    const { email, firstName, lastName, password, age } = props;

    if (isNaN(age)) return ["Age should be a number"];

    if (!email) return ["Email is required"];
    if (!email.includes("@")) return ["Invalid email"];
    if (email.length < 8 || email.length > 40)
      return ["Email must have more than 7 and less than characters 40"];

    if (!firstName) return ["Firstname is required"];
    if (firstName.length < 4 || firstName.length > 30)
      return ["Firstname must have more than 3  and less than characters 30"];

    if (!lastName) return ["Lastname is required"];
    if (lastName.length < 4 || lastName.length > 30)
      return ["Lastname must have more than 3  and less than characters 30"];

    if (!password) return ["Password is required"];
    if (password.toString().length < 6)
      return ["Password must have at least 6 characters"];

    return [
      undefined,
      new CreateUserDTO(email, firstName, lastName, password.toString(), age),
    ];
  }
}
