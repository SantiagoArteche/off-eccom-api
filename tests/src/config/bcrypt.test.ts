import { Bcrypt } from "../../../src/config";



describe("tests on bcrypt.ts", () => {
  const password = "123456";

  const bcrypt = Bcrypt;
  test("Bcrypt methods must be functions", () => {
    expect(typeof bcrypt.hashPassword).toBe("function");
    expect(typeof bcrypt.comparePasswords).toBe("function");
  });

  test("hashPasswords must cypher a string", () => {
    const cypherPassword = bcrypt.hashPassword(password);

    expect(password).not.toBe(cypherPassword);
    expect(cypherPassword).toHaveLength(60);
    expect(cypherPassword).toBeTruthy();
  });

  test("hashPasswords method must fail if argument is not string", () => {
    try {
      bcrypt.hashPassword(3 as any);
    } catch (error: any) {
      expect(error.toString()).toContain(
        "data must be a string or Buffer and salt must either be a salt string or a number of rounds"
      );
    }
  });

  test("comparePasswords method must return true if passwords are equal ", () => {
    const hashPassword = bcrypt.hashPassword(password);
    const comparePasswords = bcrypt.comparePasswords(password, hashPassword);

    expect(comparePasswords).toBeTruthy();
  });

  test("comparePasswords method must return false if passwords are not equal ", () => {
    const hashPassword = bcrypt.hashPassword(password);
    const comparePasswords = bcrypt.comparePasswords("123465", hashPassword);

    expect(comparePasswords).toBeFalsy();
  });
});
