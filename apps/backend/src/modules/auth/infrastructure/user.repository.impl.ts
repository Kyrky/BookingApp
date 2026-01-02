import type { PrismaClient, User as PrismaUser } from "@repo/database";
import { UserRepository, User, UserRole, CreateUserData } from "@repo/shared";

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    console.log(`[REPOSITORY] Finding user by email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`[REPOSITORY] User not found: ${email}`);
      return null;
    }

    console.log(`[REPOSITORY] User found: ${user.id}`);
    return this.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    console.log(`[REPOSITORY] Finding user by id: ${id}`);
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      console.log(`[REPOSITORY] User not found: ${id}`);
      return null;
    }

    return this.toDomain(user);
  }

  async create(data: CreateUserData): Promise<User> {
    console.log(`[REPOSITORY] Creating user: ${data.email}`);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role as any,
      },
    });

    console.log(`[REPOSITORY] User created: ${user.id}`);
    return this.toDomain(user);
  }

  async update(id: string, data: Partial<CreateUserData>): Promise<User> {
    console.log(`[REPOSITORY] Updating user: ${id}`);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role as any }),
      },
    });

    console.log(`[REPOSITORY] User updated: ${user.id}`);
    return this.toDomain(user);
  }

  async delete(id: string): Promise<void> {
    console.log(`[REPOSITORY] Deleting user: ${id}`);
    await this.prisma.user.delete({
      where: { id },
    });
    console.log(`[REPOSITORY] User deleted: ${id}`);
  }

  private toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.name || "",
      (prismaUser as any).role || UserRole.USER,
      prismaUser.createdAt,
      (prismaUser as any).updatedAt || prismaUser.createdAt
    );
  }
}
