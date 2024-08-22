import { Router } from "express";
import { UserController } from "./controller";
import { UserService } from "../services/user.service";

export class UserRoutes {
  static get routes() {
    const router = Router();

    const userService = new UserService();
    const userController = new UserController(userService);

    router.get("/", userController.getUsers);
    router.post("/", userController.createUser);

    router.get("/:id", userController.getUserById);
    router.post("/:id", userController.reSendValidation);
    router.put("/:id", userController.updateUserById);
    router.delete("/:id", userController.deleteUserById);

    return router;
  }
}
