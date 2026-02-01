import { describe, it, expect, beforeEach } from "vitest";
import { toDomain, toPrismaData } from "../prisma-property.mapper";
import { Property, PropertyStatus, Address, Price } from "@repo/shared";
import { Property as PrismaProperty } from "@repo/database";

describe("prisma-property.mapper", () => {
  let mockPrismaProperty: PrismaProperty;
  let mockProperty: Property;

  beforeEach(() => {
    mockPrismaProperty = {
      id: "property-123",
      title: "Test Property",
      description: "A beautiful test property",
      address: "123 Main Street",
      pricePerNight: 100,
      imageUrl: "https://example.com/image.jpg",
      ownerId: "owner-123",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    mockProperty = Property.create({
      id: "property-123",
      title: "Test Property",
      description: "A beautiful test property",
      address: Address.create("123 Main Street"),
      pricePerNight: Price.create(100),
      imageUrl: "https://example.com/image.jpg",
      ownerId: "owner-123",
      status: PropertyStatus.AVAILABLE,
      createdAt: new Date("2025-01-01"),
    });
  });

  describe("toDomain", () => {
    it("should map Prisma property to domain Property", () => {
      const result = toDomain(mockPrismaProperty);

      expect(result.id).toBe("property-123");
      expect(result.getTitle()).toBe("Test Property");
      expect(result.getDescription()).toBe("A beautiful test property");
      expect(result.getAddress().toString()).toBe("123 Main Street");
      expect(result.getPricePerNight().toNumber()).toBe(100);
      expect(result.getImageUrl()).toBe("https://example.com/image.jpg");
      expect(result.ownerId).toBe("owner-123");
      expect(result.status).toBe(PropertyStatus.AVAILABLE);
      expect(result.createdAt).toEqual(mockPrismaProperty.createdAt);
    });

    it("should handle property with null imageUrl", () => {
      const prismaPropertyWithNullImage = {
        ...mockPrismaProperty,
        imageUrl: null,
      };

      const result = toDomain(prismaPropertyWithNullImage);

      expect(result.getImageUrl()).toBeNull();
    });

    it("should handle property with undefined imageUrl", () => {
      const prismaPropertyWithUndefinedImage = {
        ...mockPrismaProperty,
        imageUrl: undefined as any,
      };

      const result = toDomain(prismaPropertyWithUndefinedImage);

      expect(result.getImageUrl()).toBeNull();
    });

    it("should convert address string to Address value object", () => {
      const result = toDomain(mockPrismaProperty);

      expect(result.getAddress()).toBeInstanceOf(Address);
      expect(result.getAddress().toString()).toBe("123 Main Street");
    });

    it("should convert price number to Price value object", () => {
      const result = toDomain(mockPrismaProperty);

      expect(result.getPricePerNight()).toBeInstanceOf(Price);
      expect(result.getPricePerNight().toNumber()).toBe(100);
    });

    it("should always set status to AVAILABLE", () => {
      const result = toDomain(mockPrismaProperty);

      expect(result.status).toBe(PropertyStatus.AVAILABLE);
    });
  });

  describe("toPrismaData", () => {
    it("should map domain Property to Prisma data", () => {
      const result = toPrismaData(mockProperty);

      expect(result).toEqual({
        id: "property-123",
        title: "Test Property",
        description: "A beautiful test property",
        address: "123 Main Street",
        pricePerNight: 100,
        imageUrl: "https://example.com/image.jpg",
        ownerId: "owner-123",
        createdAt: mockProperty.createdAt,
      });
    });

    it("should convert Address value object to string", () => {
      const result = toPrismaData(mockProperty);

      expect(typeof result.address).toBe("string");
      expect(result.address).toBe("123 Main Street");
    });

    it("should convert Price value object to number", () => {
      const result = toPrismaData(mockProperty);

      expect(typeof result.pricePerNight).toBe("number");
      expect(result.pricePerNight).toBe(100);
    });

    it("should handle property with null imageUrl", () => {
      const propertyWithNullImage = Property.create({
        id: "property-456",
        title: "Test Property 2",
        description: "Another test property",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: null,
        ownerId: "owner-456",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPrismaData(propertyWithNullImage);

      expect(result.imageUrl).toBeNull();
    });

    it("should not include status, updatedAt in Prisma data", () => {
      const result = toPrismaData(mockProperty);

      expect(result).not.toHaveProperty("status");
      expect(result).not.toHaveProperty("updatedAt");
    });

    it("should preserve createdAt date", () => {
      const result = toPrismaData(mockProperty);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt).toEqual(mockProperty.createdAt);
    });
  });

  describe("Round-trip conversion", () => {
    it("should maintain data integrity through round-trip conversion", () => {
      // Note: status will always be AVAILABLE after conversion
      const domainProperty = toDomain(mockPrismaProperty);
      const prismaData = toPrismaData(domainProperty);

      expect(prismaData.id).toBe(mockPrismaProperty.id);
      expect(prismaData.title).toBe(mockPrismaProperty.title);
      expect(prismaData.description).toBe(mockPrismaProperty.description);
      expect(prismaData.address).toBe(mockPrismaProperty.address);
      expect(prismaData.pricePerNight).toBe(mockPrismaProperty.pricePerNight);
      expect(prismaData.imageUrl).toBe(mockPrismaProperty.imageUrl);
      expect(prismaData.ownerId).toBe(mockPrismaProperty.ownerId);
    });
  });
});
