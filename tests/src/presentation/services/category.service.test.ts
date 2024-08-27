import { prisma } from "../../../../src/data/postgres/init";
import { CategoryService } from "../../../../src/presentation/services/category.service";

export const CategoryTest = describe("tests on category.service.ts", () => {
  let service: CategoryService;

  let category: any;

  beforeEach(async () => {
    category = await prisma.category.create({
      data: {
        name: "newCategory",
      },
    });
    await prisma.category.create({
      data: {
        name: "newCategoryB",
      },
    });
    service = new CategoryService();
  });

  afterEach(async () => {
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.category.deleteMany({});
  });

  test("must create an instance of category service", () => {
    expect(service).toBeInstanceOf(CategoryService);
    expect(service).toHaveProperty("getAll");
    expect(service).toHaveProperty("getById");
    expect(service).toHaveProperty("create");
    expect(service).toHaveProperty("update");
    expect(service).toHaveProperty("delete");
    expect(typeof service.create).toBe("function");
    expect(typeof service.delete).toBe("function");
    expect(typeof service.update).toBe("function");
    expect(typeof service.getAll).toBe("function");
    expect(typeof service.getById).toBe("function");
  });

  test("getAll must return an object with page, limit, prev , next, totalCategories and categories", async () => {
    const mockObject = { limit: 10, page: 1 };

    try {
      const categories = await service.getAll(mockObject);

      expect(categories).toBeTruthy();
      expect(categories).toEqual({
        categories: [expect.any(Object), expect.any(Object)],
        currentPage: 1,
        limit: 10,
        next: "/api/categories?page=2&limit=10",
        prev: null,
        totalCategories: expect.any(Number),
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getAll must fail if is provided with wrong values", async () => {
    const mockObject = { limit: "bxas", page: "bxxx" };
    try {
      const categories = await service.getAll(mockObject as any);

      expect(categories).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("getById must return an object with the new category", async () => {
    try {
      const getById = await service.getById(category.id);

      expect(getById).toBeTruthy();
      expect(getById).toEqual({
        category: {
          createdAt: expect.any(Date),
          id: expect.any(String),
          name: "newCategory",
          updatedAt: expect.any(Date),
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getById must return an error if category not found", async () => {
    const id = "a6c02b5a-c8df-4405-b607-75a4aa9c557e";
    try {
      await service.getById(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(`Error: Category with id ${id} not found`);
    }
  });

  test("getById must return an error if wrong values are provided", async () => {
    const id = 44;
    try {
      await service.getById(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("create must return an object with the new category", async () => {
    const mockObject = { name: "newCat", createdAt: new Date() };

    try {
      const newCategory = await service.create(mockObject);
      expect(newCategory).toBeTruthy();
      expect(newCategory).toEqual({
        category: {
          createdAt: expect.any(Date),
          id: expect.any(String),
          name: "newCat",
          updatedAt: expect.any(Date),
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("create must return an error if category already exists", async () => {
    const mockObject = { name: "newCategory", createdAt: new Date() };

    try {
      await service.create(mockObject);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Category already exist");
    }
  });

  test("create must return an error if wrong values are provided", async () => {
    const mockObject = { name: 55, createdAt: new Date() };

    try {
      await service.create(mockObject as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("delete must return a string with the category id deleted", async () => {
    try {
      const deleteCategory = await service.delete(category.id);
      expect(deleteCategory).toBeTruthy();
      expect(deleteCategory).toBe(
        `Category with id ${category.id} was deleted`
      );
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("delete must return an error if category not found", async () => {
    const id = "a6c02b5a-c8df-4405-b607-75a4aa9c557e";
    try {
      await service.delete(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Category not found");
    }
  });

  test("delete must return an error if exists a product while using a category", async () => {
    try {
      await prisma.products.create({
        data: {
          name: "newProduct",
          category: "newCategory",
          lowStock: false,
          stock: 33,
          price: 202,
        },
      });

      await service.delete(category.id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        "Error: This category have a relation with one o more products"
      );
    }
  });

  test("delete must fail if is wrong values are provided", async () => {
    const id = 5454;
    try {
      await service.delete(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("update must return an object with the updated category", async () => {
    const mockObject = {
      id: category.id,
      updateCategoryDto: {
        name: "updateCategory",
      },
    };

    try {
      const updatedCategory = await service.update(
        mockObject.id,
        mockObject.updateCategoryDto
      );
      expect(updatedCategory).toBeTruthy();
      expect(updatedCategory).toEqual({
        updatedCategory: {
          ...category,
          name: mockObject.updateCategoryDto.name,
          updatedAt: expect.any(Date),
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("update must return an error if category not exists", async () => {
    const mockObject = {
      id: "a6c02b5a-c8df-4405-b607-75a4aa9c557e",
      updateCategoryDto: {
        name: "updateCategory",
      },
    };
    try {
      await service.update(mockObject.id, mockObject.updateCategoryDto);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        `Error: Category with id ${mockObject.id} not found`
      );
    }
  });

  test("update must return an error if name already exists", async () => {
    const mockObject = {
      id: category.id,
      updateCategoryDto: {
        name: "55",
      },
    };

    try {
      await service.update(mockObject.id, mockObject.updateCategoryDto);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        `Error: Category with id ${mockObject.id} not found`
      );
    }
  });

  test("update must fail if wrong values are provided", async () => {
    const mockObject = {
      id: category.id,
      updateCategoryDto: {
        name: "newCategoryB",
      },
    };
    try {
      await service.update(mockObject.id, mockObject.updateCategoryDto as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        "Error: Category with that name already exist"
      );
    }
  });
});
