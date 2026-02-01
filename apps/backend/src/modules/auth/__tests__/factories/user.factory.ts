import { User, UserRole, CreateUserData } from "@repo/shared";

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: overrides.id || "user-123",
      email: overrides.email || "test@example.com",
      password: overrides.password || "$2b$10$hashedpassword",
      name: overrides.name || "Test User",
      role: overrides.role || UserRole.USER,
      createdAt: overrides.createdAt || new Date("2025-01-01"),
      updatedAt: overrides.updatedAt || new Date("2025-01-01"),
    };
  }

  static createUserData(overrides: Partial<CreateUserData> = {}): CreateUserData {
    return {
      email: overrides.email || "newuser@example.com",
      password: overrides.password || "hashedPassword123",
      name: overrides.name || "New User",
      role: overrides.role || UserRole.USER,
    };
  }

  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({ ...overrides, role: UserRole.ADMIN });
  }

  static withEmail(email: string): User {
    return this.create({ email });
  }

  static withId(id: string): User {
    return this.create({ id });
  }
}
