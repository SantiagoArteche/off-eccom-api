import { Bcrypt } from "../../config/bcrypt";
import { CustomError } from "../../domain/errors/custom-errors";
import { PaginationDTO, CreateUserDTO, UpdateUserDTO } from "../../domain/dtos";
import { prisma } from "../../data/postgres/init";

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

      if (!user) throw CustomError.notFound(`User with id ${id} not found`);

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

  async update(
    { age, email, firstName, lastName, password }: UpdateUserDTO,
    id: string
  ) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) throw CustomError.notFound(`User with id ${id} not found`);

      const updateUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          firstName: firstName ? firstName : user.firstName,
          lastName: lastName ? lastName : user.lastName,
          email: email ? email : user.email,
          age: age ? age : user.age,
          password: password ? Bcrypt.hashPassword(password) : user.password,
        },
      });

      const { password: updatePass, role, ...rest } = updateUser;

      return { msg: `User Updated`, user: rest };
    } catch (error: any) {
      if (error.code === "P2002")
        throw CustomError.badRequest("Email already in use");

      throw error;
    }
  }

  async delete(id: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) throw CustomError.notFound(`User with id ${id} not found`);

      const userCart = await prisma.cart.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (userCart) {
        prisma.$transaction(async (tx) => {
          if (userCart?.cartItemId.length)
            userCart.cartItemId.forEach(async (itemId) => {
              await tx.cartItem.delete({
                where: {
                  id: itemId,
                },
              });
            });

          await Promise.all([
            tx.cart.delete({
              where: {
                id: userCart.id,
              },
            }),
            tx.user.delete({
              where: {
                id,
              },
            }),
          ]);
        });
      } else {
        await prisma.user.delete({
          where: {
            id,
          },
        });
      }

      return `User with id ${user.id} was deleted`;
    } catch (error: any) {
      throw error;
    }
  }
}
