import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaPropertyRepository } from "../prisma-property.repository";
import { Property, PropertyNotFoundError, Address, Price, PropertyStatus } from "@repo/shared";
import { prisma } from "@repo/database";
import { PropertyFactory } from "../../__tests__/factories/property.factory";

// Mock prisma
vi.mock("@repo/database", () => ({
  prisma: {
    property: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("PrismaPropertyRepository", () => {
  let repository: PrismaPropertyRepository;
  let mockPrismaProperty: any;

  beforeEach(() => {
    repository = new PrismaPropertyRepository();
    mockPrismaProperty = prisma.property as any;

    // Clear all mocks before each test
    vi.clearAllMocks();

    // Suppress console.error output during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("findAll", () => {
    it("should return empty array when no properties exist", async () => {
      mockPrismaProperty.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(mockPrismaProperty.findMany).toHaveBeenCalledOnce();
    });

    it("should return all properties", async () => {
      const mockProperties = [
        {
          id: "property-1",
          title: "Property 1",
          description: "Description 1",
          address: "Address 1",
          pricePerNight: 100,
          imageUrl: "image1.jpg",
          ownerId: "owner-1",
          createdAt: new Date("2025-01-01"),
        },
        {
          id: "property-2",
          title: "Property 2",
          description: "Description 2",
          address: "Address 2",
          pricePerNight: 200,
          imageUrl: "image2.jpg",
          ownerId: "owner-2",
          createdAt: new Date("2025-01-02"),
        },
      ];

      mockPrismaProperty.findMany.mockResolvedValue(mockProperties);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Property);
      expect(result[0].id).toBe("property-1");
      expect(result[1].id).toBe("property-2");
    });

    it("should map prisma models to domain entities", async () => {
      const mockProperty = {
        id: "property-123",
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 150,
        imageUrl: "test.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findMany.mockResolvedValue([mockProperty]);

      const result = await repository.findAll();

      expect(result[0].getTitle()).toBe("Test Property");
      expect(result[0].getDescription()).toBe("Test Description");
      expect(result[0].getAddress()).toBeInstanceOf(Address);
      expect(result[0].getPricePerNight()).toBeInstanceOf(Price);
    });

    it("should handle database errors", async () => {
      mockPrismaProperty.findMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findAll()).rejects.toThrow("Failed to fetch properties");
      expect(console.error).toHaveBeenCalledWith(
        "Error finding all properties:",
        expect.any(Error)
      );
    });

    it("should handle properties with null imageUrl", async () => {
      const mockProperty = {
        id: "property-123",
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 150,
        imageUrl: null,
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findMany.mockResolvedValue([mockProperty]);

      const result = await repository.findAll();

      expect(result[0].getImageUrl()).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return property when found", async () => {
      const mockProperty = {
        id: "property-123",
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 150,
        imageUrl: "test.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockProperty);

      const result = await repository.findById("property-123");

      expect(result).toBeInstanceOf(Property);
      expect(result?.id).toBe("property-123");
      expect(mockPrismaProperty.findUnique).toHaveBeenCalledWith({
        where: { id: "property-123" },
      });
    });

    it("should return null when property not found", async () => {
      mockPrismaProperty.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
      expect(mockPrismaProperty.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent" },
      });
    });

    it("should handle database errors", async () => {
      mockPrismaProperty.findUnique.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findById("property-123")).rejects.toThrow("Failed to fetch property");
      expect(console.error).toHaveBeenCalledWith(
        "Error finding property by id property-123:",
        expect.any(Error)
      );
    });

    it("should handle special characters in property id", async () => {
      const mockProperty = {
        id: "property-123-@#$",
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 150,
        imageUrl: "test.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockProperty);

      const result = await repository.findById("property-123-@#$");

      expect(result?.id).toBe("property-123-@#$");
    });

    it("should handle unicode in property id", async () => {
      const mockProperty = {
        id: "property-тест",
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 150,
        imageUrl: "test.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockProperty);

      const result = await repository.findById("property-тест");

      expect(result?.id).toBe("property-тест");
    });
  });

  describe("save", () => {
    it("should create new property when it does not exist", async () => {
      const property = PropertyFactory.create({ id: "new-property" });

      const mockCreatedProperty = {
        id: "new-property",
        title: "Test Property",
        description: "A lovely test property located in a great area",
        address: "123 Test St, Test City, Test Country",
        pricePerNight: 100,
        imageUrl: null,
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(null);
      mockPrismaProperty.create.mockResolvedValue(mockCreatedProperty);

      const result = await repository.save(property);

      expect(result).toBeInstanceOf(Property);
      expect(mockPrismaProperty.findUnique).toHaveBeenCalledWith({
        where: { id: "new-property" },
      });
      expect(mockPrismaProperty.create).toHaveBeenCalledWith({
        data: {
          id: "new-property",
          title: "Test Property",
          description: "A lovely test property located in a great area",
          address: "123 Test St, Test City, Test Country",
          pricePerNight: 100,
          imageUrl: null,
          ownerId: "owner-123",
        },
      });
    });

    it("should update existing property", async () => {
      const property = PropertyFactory.create({
        id: "existing-property",
        title: "Updated Title",
        description: "Updated Description",
      });

      const mockExistingProperty = {
        id: "existing-property",
        title: "Old Title",
        description: "Old Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: "old.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      const mockUpdatedProperty = {
        id: "existing-property",
        title: "Updated Title",
        description: "Updated Description",
        address: "123 Test St, Test City, Test Country",
        pricePerNight: 100,
        imageUrl: null,
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockExistingProperty);
      mockPrismaProperty.update.mockResolvedValue(mockUpdatedProperty);

      const result = await repository.save(property);

      expect(result).toBeInstanceOf(Property);
      expect(mockPrismaProperty.findUnique).toHaveBeenCalledWith({
        where: { id: "existing-property" },
      });
      expect(mockPrismaProperty.update).toHaveBeenCalledWith({
        where: { id: "existing-property" },
        data: {
          title: "Updated Title",
          description: "Updated Description",
          address: "123 Test St, Test City, Test Country",
          pricePerNight: 100,
          imageUrl: null,
        },
      });
    });

    it("should handle database errors on create", async () => {
      const property = PropertyFactory.create({ id: "new-property" });

      mockPrismaProperty.findUnique.mockResolvedValue(null);
      mockPrismaProperty.create.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.save(property)).rejects.toThrow("Failed to save property");
      expect(console.error).toHaveBeenCalledWith(
        "Error saving property new-property:",
        expect.any(Error)
      );
    });

    it("should handle database errors on update", async () => {
      const property = PropertyFactory.create({ id: "existing-property" });

      const mockExistingProperty = {
        id: "existing-property",
        title: "Old Title",
        description: "Old Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: "old.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockExistingProperty);
      mockPrismaProperty.update.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.save(property)).rejects.toThrow("Failed to save property");
    });

    it("should preserve price when updating", async () => {
      const property = PropertyFactory.create({
        id: "existing-property",
        pricePerNight: Price.create(250),
      });

      const mockExistingProperty = {
        id: "existing-property",
        title: "Test Property",
        description: "Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: null,
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      const mockUpdatedProperty = {
        id: "existing-property",
        title: "Test Property",
        description: "Description",
        address: "123 Test St, Test City, Test Country",
        pricePerNight: 250,
        imageUrl: null,
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockExistingProperty);
      mockPrismaProperty.update.mockResolvedValue(mockUpdatedProperty);

      await repository.save(property);

      expect(mockPrismaProperty.update).toHaveBeenCalledWith({
        where: { id: "existing-property" },
        data: expect.objectContaining({
          pricePerNight: 250,
        }),
      });
    });
  });

  describe("delete", () => {
    it("should delete existing property", async () => {
      const mockProperty = {
        id: "property-123",
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: "test.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockProperty);
      mockPrismaProperty.delete.mockResolvedValue(mockProperty);

      await expect(repository.delete("property-123")).resolves.toBeUndefined();

      expect(mockPrismaProperty.findUnique).toHaveBeenCalledWith({
        where: { id: "property-123" },
      });
      expect(mockPrismaProperty.delete).toHaveBeenCalledWith({
        where: { id: "property-123" },
      });
    });

    it("should throw PropertyNotFoundError when property does not exist", async () => {
      mockPrismaProperty.findUnique.mockResolvedValue(null);

      await expect(repository.delete("non-existent")).rejects.toThrow(PropertyNotFoundError);

      expect(mockPrismaProperty.delete).not.toHaveBeenCalled();
    });

    it("should include property id in PropertyNotFoundError message", async () => {
      mockPrismaProperty.findUnique.mockResolvedValue(null);

      await expect(repository.delete("property-123")).rejects.toThrow(
        'Property with id "property-123" not found'
      );
    });

    it("should handle database errors during delete", async () => {
      const mockProperty = {
        id: "property-123",
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: "test.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockProperty);
      mockPrismaProperty.delete.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.delete("property-123")).rejects.toThrow("Failed to delete property");
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting property property-123:",
        expect.any(Error)
      );
    });

    it("should handle special characters in property id", async () => {
      const mockProperty = {
        id: "property-@#$",
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: "test.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockProperty);
      mockPrismaProperty.delete.mockResolvedValue(mockProperty);

      await expect(repository.delete("property-@#$")).resolves.toBeUndefined();
    });

    it("should not catch PropertyNotFoundError", async () => {
      mockPrismaProperty.findUnique.mockResolvedValue(null);

      await expect(repository.delete("property-123")).rejects.toThrow(PropertyNotFoundError);
      // The error should not be caught and converted to a generic error
    });
  });

  describe("Edge cases", () => {
    it("should handle empty property id", async () => {
      mockPrismaProperty.findUnique.mockResolvedValue(null);

      await expect(repository.findById("")).resolves.toBeNull();
    });

    it("should handle very long property id", async () => {
      const longId = "a".repeat(1000);
      const mockProperty = {
        id: longId,
        title: "Test Property",
        description: "Test Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: "test.jpg",
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(mockProperty);

      const result = await repository.findById(longId);
      expect(result?.id).toBe(longId);
    });

    it("should handle property with very long title", async () => {
      const longTitle = "A".repeat(200); // Max allowed length
      const property = PropertyFactory.create({ title: longTitle });

      const mockProperty = {
        id: "property-123",
        title: longTitle,
        description: "Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: null,
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(null);
      mockPrismaProperty.create.mockResolvedValue(mockProperty);

      const result = await repository.save(property);
      expect(result.getTitle()).toBe(longTitle);
    });

    it("should handle property with very long description", async () => {
      const longDescription = "B".repeat(5000);
      const property = PropertyFactory.create({ description: longDescription });

      const mockProperty = {
        id: "property-123",
        title: "Test Property",
        description: longDescription,
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: null,
        ownerId: "owner-123",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(null);
      mockPrismaProperty.create.mockResolvedValue(mockProperty);

      const result = await repository.save(property);
      expect(result.getDescription()).toBe(longDescription);
    });
  });

  describe("Data integrity", () => {
    it("should preserve all property fields when creating", async () => {
      const property = PropertyFactory.create({
        id: "property-123",
        ownerId: "owner-456",
        title: "Custom Title",
        description: "Custom Description",
        pricePerNight: Price.create(300),
        imageUrl: "custom.jpg",
      });

      const mockProperty = {
        id: "property-123",
        title: "Custom Title",
        description: "Custom Description",
        address: "123 Test St, Test City, Test Country",
        pricePerNight: 300,
        imageUrl: "custom.jpg",
        ownerId: "owner-456",
        createdAt: new Date("2025-01-01"),
      };

      mockPrismaProperty.findUnique.mockResolvedValue(null);
      mockPrismaProperty.create.mockResolvedValue(mockProperty);

      const result = await repository.save(property);

      expect(result.id).toBe("property-123");
      expect(result.ownerId).toBe("owner-456");
      expect(result.getTitle()).toBe("Custom Title");
      expect(result.getDescription()).toBe("Custom Description");
      expect(result.getPricePerNight().toNumber()).toBe(300);
      expect(result.getImageUrl()).toBe("custom.jpg");
    });

    it("should preserve createdAt timestamp", async () => {
      const originalDate = new Date("2020-01-01");
      const property = PropertyFactory.create({ createdAt: originalDate });

      const mockProperty = {
        id: "property-123",
        title: "Test Property",
        description: "Description",
        address: "123 Test St",
        pricePerNight: 100,
        imageUrl: null,
        ownerId: "owner-123",
        createdAt: originalDate,
      };

      mockPrismaProperty.findUnique.mockResolvedValue(null);
      mockPrismaProperty.create.mockResolvedValue(mockProperty);

      const result = await repository.save(property);
      expect(result.createdAt).toEqual(originalDate);
    });
  });
});
