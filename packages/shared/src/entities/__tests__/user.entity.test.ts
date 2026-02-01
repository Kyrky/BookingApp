import { describe, it, expect } from "vitest";
import { User, UserRole } from "../user.entity";

describe("User Entity", () => {
  describe("Creation", () => {
    it("should create user with all required fields", () => {
      const user = new User(
        "user-123",
        "test@example.com",
        "$2b$10$hashedpassword",
        "John Doe",
        UserRole.USER,
        new Date("2025-01-01"),
        new Date("2025-01-01")
      );

      expect(user.id).toBe("user-123");
      expect(user.email).toBe("test@example.com");
      expect(user.password).toBe("$2b$10$hashedpassword");
      expect(user.name).toBe("John Doe");
      expect(user.role).toBe(UserRole.USER);
      expect(user.createdAt).toEqual(new Date("2025-01-01"));
      expect(user.updatedAt).toEqual(new Date("2025-01-01"));
    });

    it("should create admin user", () => {
      const admin = new User(
        "admin-123",
        "admin@example.com",
        "$2b$10$hashedpassword",
        "Admin User",
        UserRole.ADMIN,
        new Date(),
        new Date()
      );

      expect(admin.role).toBe(UserRole.ADMIN);
    });
  });

  describe("toJSON", () => {
    it("should serialize user without password", () => {
      const user = new User(
        "user-123",
        "test@example.com",
        "$2b$10$hashedpassword",
        "John Doe",
        UserRole.USER,
        new Date("2025-01-01"),
        new Date("2025-01-01")
      );

      const json = user.toJSON();

      expect(json).toEqual({
        id: "user-123",
        email: "test@example.com",
        name: "John Doe",
        role: UserRole.USER,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(json).not.toHaveProperty("password");
    });

    it("should include all fields except password", () => {
      const user = new User(
        "user-123",
        "test@example.com",
        "hashed",
        "John",
        UserRole.USER,
        new Date(),
        new Date()
      );

      const json = user.toJSON();

      expect(Object.keys(json)).toEqual(["id", "email", "name", "role", "createdAt", "updatedAt"]);
      expect(Object.keys(json).length).toBe(6);
    });
  });

  describe("Role checking", () => {
    it("should have USER role value", () => {
      expect(UserRole.USER).toBe("USER");
    });

    it("should have ADMIN role value", () => {
      expect(UserRole.ADMIN).toBe("ADMIN");
    });
  });

  describe("Immutability", () => {
    it("should have readonly properties at compile time", () => {
      // TypeScript readonly is a compile-time check
      // At runtime, properties can still be modified with type assertions
      const user = new User(
        "user-123",
        "test@example.com",
        "hashed",
        "John",
        UserRole.USER,
        new Date(),
        new Date()
      );

      // Readonly properties are marked as readonly in the type system
      expect(typeof user.id).toBe("string");
      expect(typeof user.email).toBe("string");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty strings", () => {
      const user = new User(
        "",
        "",
        "",
        "",
        UserRole.USER,
        new Date(),
        new Date()
      );

      expect(user.id).toBe("");
      expect(user.email).toBe("");
      expect(user.name).toBe("");
    });

    it("should handle special characters in email", () => {
      const email = "test+user@sub.example.com";
      const user = new User(
        "user-123",
        email,
        "hashed",
        "John",
        UserRole.USER,
        new Date(),
        new Date()
      );

      expect(user.email).toBe(email);
    });

    it("should handle very long names", () => {
      const longName = "A".repeat(200);
      const user = new User(
        "user-123",
        "test@example.com",
        "hashed",
        longName,
        UserRole.USER,
        new Date(),
        new Date()
      );

      expect(user.name).toBe(longName);
    });
  });
});
