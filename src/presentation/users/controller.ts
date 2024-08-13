import { Request, Response } from "express";
import { CreateUserDTO } from "../../domain/dtos/users/create-user.dto";
import { UserService } from "../services/user.service";
import { PaginationDTO } from "../../domain/dtos/shared/pagination.dto";
import { UpdateUserDTO } from "../../domain/dtos/users/update-user.dto";

export class UserController {
  constructor(private readonly userService: UserService) {}

  getUsers = (req: Request, res: Response) => {
    const { limit = 10, page = 1 } = req.query;
    const [error, PaginationDto] = PaginationDTO.create(+page, +limit);

    if (error)
      return res.status(400).send({
        ok: false,
        msg: error,
      });

    this.userService
      .getAll(PaginationDto!)
      .then((users) => res.status(200).send(users))
      .catch((error) => res.status(400).send(error));
  };

  getUserById = (req: Request, res: Response) => {
    const { id } = req.params;

    this.userService
      .getOne(id)
      .then((user) => res.status(200).send(user))
      .catch((error) => res.status(400).send(error));
  };

  createUser = (req: Request, res: Response) => {
    const [error, createUserDto] = CreateUserDTO.create(req.body)!;

    if (error) return res.status(400).send({ ok: false, msg: error });

    this.userService
      .create(createUserDto!)
      .then((user) => res.status(201).send(user))
      .catch((error) => res.status(400).send(error));
  };

  updateUserById = (req: Request, res: Response) => {
    const { id } = req.params;
    const [error, updateUserDto] = UpdateUserDTO.create(req.body);

    if (error) return res.status(400).send({ ok: false, msg: error });

    this.userService
      .update(updateUserDto!, id)
      .then((user) => res.status(201).send(user))
      .catch((error) => res.status(400).send(error));
  };

  deleteUserById = (req: Request, res: Response) => {
    const { id } = req.params;

    this.userService
      .delete(id)
      .then((user) => res.status(201).send(user))
      .catch((error) => res.status(400).send(error));
  };
}
