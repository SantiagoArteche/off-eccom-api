import { Server } from "../../../src/presentation/server";
import { testServer } from "../../test-server";

describe("tests on server.ts", () => {
  const serverSpy = jest.spyOn(Server.prototype, "start");
  const closeSpy = jest.spyOn(Server.prototype, "close");

  beforeAll(async () => {
    await testServer.start();
  });
  afterAll(async () => {
    await testServer.close();
    expect(closeSpy).toHaveBeenCalled();
  });

  test("must start the server", async () => {
    expect(testServer).toBeInstanceOf(Server);
    expect(testServer).toHaveProperty("PORT");
    expect(testServer).toHaveProperty("routes");
    expect(typeof testServer.start).toBe("function");
    expect(serverSpy).toHaveBeenCalledTimes(1);
  });
});
