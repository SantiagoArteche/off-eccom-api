import { prisma } from "../../../../src/data/postgres/init";
import { ProductService } from "../../../../src/presentation/services/product.service";

export const ProductTest = describe("tests on product.service.ts", () => {
  let service: ProductService;

  let product: any;
  beforeEach(async () => {
    service = new ProductService();
    await prisma.category.create({
      data: {
        name: "newCategory",
      },
    });

    product = await prisma.products.create({
      data: {
        category: "newCategory",
        name: "newProduct",
        lowStock: false,
        stock: 20,
        price: 1500,
      },
    });

    await prisma.products.create({
      data: {
        category: "newCategory",
        name: "newProductb",
        lowStock: false,
        stock: 20,
        price: 1500,
      },
    });
  });

  afterEach(async () => {
    await prisma.products.deleteMany();
    await prisma.category.deleteMany();
  });

  test("must create an instance of product service", () => {
    expect(service).toBeInstanceOf(ProductService);
    expect(service).toHaveProperty("getAll");
    expect(service).toHaveProperty("getById");
    expect(service).toHaveProperty("create");
    expect(service).toHaveProperty("update");
    expect(service).toHaveProperty("delete");
    expect(typeof service.getAll).toBe("function");
    expect(typeof service.getById).toBe("function");
    expect(typeof service.create).toBe("function");
    expect(typeof service.update).toBe("function");
    expect(typeof service.delete).toBe("function");
  });

  test("getAll must return an object with page, limit, prev , next, totalProducts and products", async () => {
    const mockObject = { limit: 10, page: 1 };
    try {
      const allProducts = await service.getAll(mockObject);
      expect(allProducts).toBeTruthy();
      expect(allProducts).toEqual({
        currentPage: 1,
        limit: 10,
        next: "/api/products?page=2&limit=10",
        prev: null,
        products: [expect.any(Object), expect.any(Object)],
        totalProducts: expect.any(Number),
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getAll must fail if wrong values are provided", async () => {
    const mockObject = { limit: "x", page: 1 };
    try {
      const allProducts = await service.getAll(mockObject as any);
      expect(allProducts).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain(`Invalid value provided`);
    }
  });

  test("getById must return the product found", async () => {
    try {
      const findProduct = await service.getById(product.id);
      expect(findProduct).toBeTruthy();
      expect(findProduct).toEqual({
        product: {
          name: "newProduct",
          category: "newCategory",
          createdAt: expect.any(Date),
          id: expect.any(String),
          lowStock: expect.any(Boolean),
          price: expect.any(Number),
          stock: expect.any(Number),
          updatedAt: expect.any(Date),
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("getById must return an error if product not found", async () => {
    const id = "a6c02b5a-c8df-4405-b607-75a4aa9c557x";
    try {
      await service.getById(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(`Error: Product with id ${id} not found`);
    }
  });

  test("getById must fail if wrong values are provided", async () => {
    const id = 34343;
    try {
      await service.getById(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain(`Invalid value provided`);
    }
  });

  test("create must return the new product", async () => {
    try {
      const newProduct = await service.create({
        category: "newCategory",
        name: "newProductB",
        lowStock: false,
        stock: 20,
        price: 1500,
        createdAt: new Date(),
      });
      expect(newProduct).toBeTruthy();
      expect(newProduct).toEqual({
        product: {
          category: "newCategory",
          createdAt: expect.any(Date),
          id: expect.any(String),
          lowStock: expect.any(Boolean),
          name: "newProductB",
          price: 1500,
          stock: 20,
          updatedAt: expect.any(Date),
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("create must return an error if the product already exists", async () => {
    try {
      const newProduct = await service.create({
        category: "newCategory",
        name: "newProduct",
        lowStock: false,
        stock: 20,
        price: 1500,
        createdAt: new Date(),
      });
      expect(newProduct).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        "Error: Product with that name already exist"
      );
    }
  });

  test("create must return an error if the category of the product doesn't exists", async () => {
    try {
      const newProduct = await service.create({
        category: "notExists",
        name: "newProductB",
        lowStock: false,
        stock: 20,
        price: 1500,
        createdAt: new Date(),
      });
      expect(newProduct).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Category not exists");
    }
  });

  test("create must fail if wrong values are provided", async () => {
    try {
      const newProduct = await service.create({
        category: "notExists",
        name: "newProductB",
        lowStock: false,
        stock: "bxd" as any,
        price: 1500,
        createdAt: new Date(),
      });
      expect(newProduct).toBeFalsy();
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("update must return an object with the updated product", async () => {
    const mockObject = {
      id: product.id,
      updateProductDto: {
        name: "Updated Product",
      },
    };

    try {
      const updatedProduct = await service.update(
        mockObject.id,
        mockObject.updateProductDto
      );

      expect(updatedProduct).toBeTruthy();
      expect(updatedProduct).toEqual({
        updatedProduct: {
          category: "newCategory",
          createdAt: expect.any(Date),
          id: expect.any(String),
          lowStock: false,
          name: "Updated Product",
          price: 1500,
          stock: 20,
          updatedAt: expect.any(Date),
        },
      });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("update must return an error if product not found", async () => {
    const mockObject = {
      id: "a6c02b5a-c8df-4405-b607-75a4aa9c557x",
      updateProductDto: {
        name: "Updated Product",
      },
    };
    try {
      await service.update(mockObject.id, mockObject.updateProductDto);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        `Error: Product with id ${mockObject.id} not found`
      );
    }
  });

  test("update must return an error if category not exists", async () => {
    const mockObject = {
      id: product.id,
      updateProductDto: {
        name: "Updated Product",
        category: "?",
      },
    };
    try {
      await service.update(mockObject.id, mockObject.updateProductDto);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Category not exists");
    }
  });

  test("update must return an error if name is already in use", async () => {
    const mockObject = {
      id: product.id,
      updateProductDto: {
        name: "newProductb",
        category: "newCategory",
      },
    };
    try {
      await service.update(mockObject.id, mockObject.updateProductDto);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe(
        "Error: Product with that name already exist"
      );
    }
  });

  test("update must return an error if wrong values are provided", async () => {
    const mockObject = {
      id: product.id,
      updateProductDto: {
        name: 44,
        category: "newCategory",
      },
    };
    try {
      await service.update(mockObject.id, mockObject.updateProductDto as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });

  test("delete must return a string with the id of the product deleted", async () => {
    try {
      const deleteProduct = await service.delete(product.id);
      expect(deleteProduct).toBeTruthy();
      expect(deleteProduct).toBe(`Product with id ${product.id} was deleted`);
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  test("delete must return an error if product is not found", async () => {
    const id = "a6c02b5a-c8df-4405-b607-75a4aa9c557x";
    try {
      await service.delete(id);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toBe("Error: Product not found");
    }
  });

  test("delete should fail if wrong values are provided", async () => {
    const id = false;
    try {
      await service.delete(id as any);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error.toString()).toContain("Invalid value provided");
    }
  });
});
