import { Server } from "../src/presentation/server";

jest.mock("../src/presentation/server");

describe("test app.ts", () => {
  test("test connection", async () => {
    await import("../src/app");

    expect(Server).toHaveBeenCalledTimes(1);
    expect(Server).toHaveBeenCalledWith(expect.any(Function));
    expect(Server.prototype.start).toHaveBeenCalled();
  });
});
