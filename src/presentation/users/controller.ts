import { CustomError } from "../../domain/errors/custom-errors";
import { PaginationDTO, CreateUserDTO, UpdateUserDTO } from "../../domain/dtos";
import { UserService } from "../services/user.service";
import type { Request, Response } from "express";

export class UserController {
  constructor(private readonly userService: UserService) {}

  getUsers = (req: Request, res: Response) => {
    const { limit = 10, page = 1 } = req.query;
    const [error, paginationDto] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json(error);

    this.userService
      .getAll(paginationDto!)
      .then((users) => res.status(200).json(users))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  getUserById = (req: Request, res: Response) => {
    const { id } = req.params;

    this.userService
      .getById(id)
      .then((user) => res.status(200).json(user))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  createUser = (req: Request, res: Response) => {
    const [error, createUserDto] = CreateUserDTO.create(req.body)!;
    if (error) return res.status(400).json(error);

    this.userService
      .create(createUserDto!)
      .then((user) => res.status(201).json(user))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  updateUserById = (req: Request, res: Response) => {
    const { id } = req.params;
    const [error, updateUserDto] = UpdateUserDTO.create(req.body);

    if (error) return res.status(400).json(error);

    this.userService
      .update(updateUserDto!, id)
      .then((user) => res.status(201).json(user))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  deleteUserById = (req: Request, res: Response) => {
    const { id } = req.params;

    this.userService
      .delete(id)
      .then((user) => res.status(200).json(user))
      .catch((error) => CustomError.handleErrors(error, res));
  };

  reSendValidation = (req: Request, res: Response) => {
    const { id } = req.params;

    this.userService
      .reSendValidationMail(id)
      .then((userValidated) => res.status(200).json(userValidated))
      .catch((error) => CustomError.handleErrors(error, res));
  };
}
