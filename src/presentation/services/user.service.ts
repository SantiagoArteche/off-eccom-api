import { Bcrypt } from "../../config/bcrypt";
import { prisma } from "../../data/postgres/init";
import { PaginationDTO, CreateUserDTO, UpdateUserDTO } from "../../domain/dtos";
import { CustomError } from "../../domain/errors/custom-errors";

export class UserService {
  async getAll({ limit, page }: PaginationDTO) {
    try {
      const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.user.count(),
      ]);

      return {
        currentPage: page,
        limit,
        prev: page <= 1 ? null : `/api/users?page=${page - 1}&limit=${limit}`,
        next: `/api/users?page=${page + 1}&limit=${limit}`,
        totalUsers,
        users,
      };
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw CustomError.notFound("User not found");

      const { password, ...rest } = user;

      return { user: rest };
    } catch (error) {
      throw error;
    }
  }

  async create(createUserDto: CreateUserDTO) {
    try {
      const newUser = await prisma.user.create({
        data: {
          ...createUserDto,
          password: Bcrypt.hashPassword(createUserDto.password),
        },
      });

      const { password, ...rest } = newUser;

      return {
        msg: "User Created",
        user: rest,
      };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Email already in use");

      throw error;
    }
  }

  async update(updateUserDto: UpdateUserDTO, id: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) throw CustomError.notFound("User not found");

      const updateUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...updateUserDto,
          password:
            updateUserDto.password &&
            Bcrypt.hashPassword(updateUserDto.password),
          id: id,
        },
      });

      const { password, role, ...rest } = updateUser;

      return { msg: `User Updated`, user: rest };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Email already in use");

      throw error;
    }
  }

  async delete(id: string) {
    try {
      const user = await prisma.user.delete({ where: { id } });

      return `User with id ${user?.id} was deleted`;
    } catch (error: any) {
      if (error.code === "P2025") throw CustomError.notFound("User not found");

      throw error;
    }
  }
}
