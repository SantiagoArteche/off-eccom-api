import { CategoryController } from "./controller";
import { CategoryService } from "../services/category.service";
import { Router } from "express";

export class CategoryRoutes {
  static get routes() {
    const router = Router();

    const categoryService = new CategoryService();
    const categoryController = new CategoryController(categoryService);

    router.get("/", categoryController.getCategories);
    router.get("/:id", categoryController.getCategory);

    router.post("/", categoryController.createCategory);

    router.put("/:id", categoryController.updateCategory);

    router.delete("/:id", categoryController.deleteCategory);

    return router;
  }
}
