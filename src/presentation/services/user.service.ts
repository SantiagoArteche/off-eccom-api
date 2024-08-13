import { prisma } from "../../data/postgres/init";
import { PaginationDTO, CreateUserDTO, UpdateUserDTO } from "../../domain/dtos";

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
        ok: true,
        currentPage: page,
        limit,
        nextPage: `/api/users?page=${page + 1}&limit=${limit}`,
        prevPage:
          page === 1 ? null : `/api/users?page=${page - 1}&limit=${limit}`,
        totalUsers: totalUsers,
        users,
      };
    } catch (error) {
      return { ok: false, msg: error };
    }
  }

  async getOne(id: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id,
        },
      });

      if (!user) return { ok: false, msg: "User not found" };

      const { password, ...rest } = user;

      return { ok: true, user: rest };
    } catch (error) {
      return error;
    }
  }

  async create(createUserDto: CreateUserDTO) {
    try {
      const alreadyExist = await prisma.user.findFirst({
        where: {
          email: createUserDto.email,
        },
      });

      if (alreadyExist) throw { ok: false, msg: "User already exist" };

      const newUser = await prisma.user.create({
        data: createUserDto,
      });

      const { password, ...rest } = newUser;

      return {
        ok: true,
        msg: "User Created",
        user: rest,
      };
    } catch (error) {
      return {
        ok: false,
        msg: error,
      };
    }
  }

  async update(updateUserDto: UpdateUserDTO, id: string) {
    try {
      const user = await prisma.user.findFirst({ where: { id } });

      if (!user) return { ok: false, msg: "User not found" };

      const updateUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: { ...updateUserDto!, id: id },
      });

      const { password, role, ...rest } = updateUser;

      return { ok: true, msg: `User Updated`, user: rest };
    } catch (error: any) {
      if (error.code === "P2002")
        return { ok: false, msg: "Mail already in use" };

      return { ok: false, msg: error };
    }
  }

  async delete(id: string) {
    try {
      const user = await prisma.user.findFirst({ where: { id } });

      if (!user) return { ok: false, msg: "User not found" };

      const deleteUser = await prisma.user.delete({
        where: { id: user?.id },
      });

      return { ok: true, msg: "User Deleted", deleteUser };
    } catch (error: any) {
      return { ok: false, msg: error };
    }
  }
}
