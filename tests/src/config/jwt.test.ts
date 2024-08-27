import { Jwt } from "../../../src/config";


describe("tests on jwt.ts", () => {
  const jwt = Jwt;
  const toEncode = "123456";
  test("Jwt methods must be functions", () => {
    expect(typeof jwt.createToken).toBe("function");
    expect(typeof jwt.verifyToken).toBe("function");
  });

  test("createToken method must create a token", async () => {
    const token = await jwt.createToken({ toEncode });
    const jwtLength = 155;

    expect(typeof token).toBe("string");
    expect(token).toBeTruthy();
    expect(token).toHaveLength(jwtLength);
  });

  test("createToken method must fail", async () => {
    try {
      await jwt.createToken(333333);
    } catch (error: any) {
      expect(error.statusCode.toString()).toBe("500");
      expect(error.toString()).toContain("Error");
    }
  });

  test("verifyToken method must return a successful verification", async () => {
    const token = await jwt.createToken({ toEncode });
    const verifyToken = await jwt.verifyToken(token as any);

    expect(verifyToken).toBeTruthy();
    expect(verifyToken).toHaveProperty("toEncode");
    expect(verifyToken).toHaveProperty("exp");
    expect(verifyToken).toHaveProperty("iat");
    expect((verifyToken as any).toEncode).toBeTruthy();
    expect((verifyToken as any).toEncode).toBe("123456");
  });

  test("verifyToken method must fail", async () => {
    try {
      await jwt.verifyToken("33");
    } catch (error: any) {
      expect(error.statusCode.toString()).toBe("500");
      expect(error.toString()).toContain("jwt malformed");
    }
  });
});
