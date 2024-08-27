import { prisma } from "../../../../src/data/postgres/init";


describe("test on init.ts", () => {
  beforeEach(async () => {
    await prisma.category.deleteMany();
  });

  test("test connection to db with an insertion", async () => {
    const insertionToDB = await prisma.category.create({
      data: {
        name: "testCategory",
      },
    });

    expect(insertionToDB).toBeTruthy();
    expect(insertionToDB).toHaveProperty("id");
    expect(insertionToDB).toHaveProperty("name");
  });
});
