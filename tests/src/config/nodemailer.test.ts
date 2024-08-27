import { Nodemailer } from "../../../src/config";



describe("tests on nodemailer.ts", () => {
  let transport: Nodemailer;

  beforeAll(() => {
    transport = new Nodemailer(
      process.env.SERVICE!,
      process.env.SENDER_EMAIL!,
      process.env.SENDER_PASS!
    );
  });
  test("should create a Nodemailer instance with correct properties", () => {
    expect(transport).toBeInstanceOf(Nodemailer);
    expect(transport.sendEmail).toBeInstanceOf(Function);
  });

  test("should successfully send an email with valid details", async () => {
    const sendEmail = await transport.sendEmail({
      htmlBody: "<h1>Test</h1>",
      subject: "Testing",
      to: "sanarteche@hotmail.com",
    });

    expect(sendEmail).toBeTruthy();
  });

  test("should handle invalid recipient email gracefully", async () => {
    const sendEmail = await transport.sendEmail({
      htmlBody: "<h1>Test</h1>",
      subject: "Testing",
      to: "",
    });

    expect(sendEmail).toBeFalsy();
  });
});
