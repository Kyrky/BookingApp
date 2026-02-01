import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { toPropertyResponseDto, toPropertyListResponseDto } from "../property-response.mapper";
import { Property, PropertyStatus, Address, Price } from "@repo/shared";

describe("property-response.mapper", () => {
  let mockProperty: Property;

  beforeEach(() => {
    mockProperty = Property.create({
      id: "property-123",
      title: "Test Property",
      description: "A beautiful test property for testing",
      address: Address.create("123 Main Street"),
      pricePerNight: Price.create(100),
      imageUrl: "/uploads/image.jpg",
      ownerId: "owner-123",
      status: PropertyStatus.AVAILABLE,
      createdAt: new Date("2025-01-01"),
    });
  });

  describe("formatImageUrl", () => {
    it("should return null for null imageUrl", () => {
      const propertyWithNullImage = Property.create({
        id: "property-456",
        title: "Property Without Image",
        description: "A property without an image",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: null,
        ownerId: "owner-456",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(propertyWithNullImage);

      expect(result.imageUrl).toBeNull();
    });

    it("should return full URL for relative path", () => {
      const result = toPropertyResponseDto(mockProperty);

      expect(result.imageUrl).toMatch(/^http:\/\//);
      expect(result.imageUrl).toContain("/uploads/image.jpg");
    });

    it("should return original URL for absolute http URL", () => {
      const propertyWithHttpUrl = Property.create({
        id: "property-456",
        title: "Property With Http URL",
        description: "A property with http image URL",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: "http://example.com/image.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(propertyWithHttpUrl);

      expect(result.imageUrl).toBe("http://example.com/image.jpg");
    });

    it("should return original URL for absolute https URL", () => {
      const propertyWithHttpsUrl = Property.create({
        id: "property-456",
        title: "Property With Https URL",
        description: "A property with https image URL",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: "https://example.com/image.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(propertyWithHttpsUrl);

      expect(result.imageUrl).toBe("https://example.com/image.jpg");
    });
  });

  describe("toPropertyResponseDto", () => {
    it("should map Property to response dto", () => {
      const result = toPropertyResponseDto(mockProperty);

      expect(result).toEqual({
        id: "property-123",
        title: "Test Property",
        description: "A beautiful test property for testing",
        address: "123 Main Street",
        pricePerNight: 100,
        imageUrl: expect.stringContaining("/uploads/image.jpg"),
        ownerId: "owner-123",
        status: PropertyStatus.AVAILABLE,
        createdAt: mockProperty.createdAt,
      });
    });

    it("should convert Address value object to string", () => {
      const result = toPropertyResponseDto(mockProperty);

      expect(typeof result.address).toBe("string");
      expect(result.address).toBe("123 Main Street");
    });

    it("should convert Price value object to number", () => {
      const result = toPropertyResponseDto(mockProperty);

      expect(typeof result.pricePerNight).toBe("number");
      expect(result.pricePerNight).toBe(100);
    });

    it("should include status", () => {
      const result = toPropertyResponseDto(mockProperty);

      expect(result.status).toBe(PropertyStatus.AVAILABLE);
    });

    it("should handle property with RENTED status", () => {
      const rentedProperty = Property.create({
        id: "property-456",
        title: "Rented Property",
        description: "A rented property",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: "/uploads/image2.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.RENTED,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(rentedProperty);

      expect(result.status).toBe(PropertyStatus.RENTED);
    });

    it("should handle property with MAINTENANCE status", () => {
      const maintenanceProperty = Property.create({
        id: "property-456",
        title: "Maintenance Property",
        description: "A property under maintenance",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: "/uploads/image2.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.MAINTENANCE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(maintenanceProperty);

      expect(result.status).toBe(PropertyStatus.MAINTENANCE);
    });

    it("should handle property with INACTIVE status", () => {
      const inactiveProperty = Property.create({
        id: "property-456",
        title: "Inactive Property",
        description: "An inactive property",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: "/uploads/image2.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.INACTIVE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(inactiveProperty);

      expect(result.status).toBe(PropertyStatus.INACTIVE);
    });

    it("should preserve createdAt date", () => {
      const result = toPropertyResponseDto(mockProperty);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt).toEqual(mockProperty.createdAt);
    });
  });

  describe("toPropertyListResponseDto", () => {
    it("should map empty array to empty list", () => {
      const result = toPropertyListResponseDto([]);

      expect(result).toEqual({
        properties: [],
        total: 0,
      });
    });

    it("should map single property to list", () => {
      const result = toPropertyListResponseDto([mockProperty]);

      expect(result).toEqual({
        properties: [
          {
            id: "property-123",
            title: "Test Property",
            description: "A beautiful test property for testing",
            address: "123 Main Street",
            pricePerNight: 100,
            imageUrl: expect.stringContaining("/uploads/image.jpg"),
            ownerId: "owner-123",
            status: PropertyStatus.AVAILABLE,
            createdAt: mockProperty.createdAt,
          },
        ],
        total: 1,
      });
    });

    it("should map multiple properties to list", () => {
      const property2 = Property.create({
        id: "property-456",
        title: "Second Property",
        description: "Another beautiful property",
        address: Address.create("456 Oak Avenue"),
        pricePerNight: Price.create(200),
        imageUrl: "/uploads/image2.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.RENTED,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyListResponseDto([mockProperty, property2]);

      expect(result.total).toBe(2);
      expect(result.properties).toHaveLength(2);
      expect(result.properties[0].id).toBe("property-123");
      expect(result.properties[1].id).toBe("property-456");
    });

    it("should calculate total correctly", () => {
      const properties = [
        mockProperty,
        Property.create({
          id: "property-2",
          title: "Property 2",
          description: "Description 2",
          address: Address.create("Address 2"),
          pricePerNight: Price.create(100),
          ownerId: "owner-2",
        }),
        Property.create({
          id: "property-3",
          title: "Property 3",
          description: "Description 3",
          address: Address.create("Address 3"),
          pricePerNight: Price.create(100),
          ownerId: "owner-3",
        }),
      ];

      const result = toPropertyListResponseDto(properties);

      expect(result.total).toBe(3);
    });

    it("should handle properties with different statuses", () => {
      const availableProperty = Property.create({
        id: "property-1",
        title: "Available Property",
        description: "An available property",
        address: Address.create("123 Main St"),
        pricePerNight: Price.create(100),
        imageUrl: "/uploads/image1.jpg",
        ownerId: "owner-1",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-01"),
      });
      const rentedProperty = Property.create({
        id: "property-2",
        title: "Rented Property",
        description: "A rented property",
        address: Address.create("456 Oak St"),
        pricePerNight: Price.create(150),
        imageUrl: "/uploads/image2.jpg",
        ownerId: "owner-2",
        status: PropertyStatus.RENTED,
        createdAt: new Date("2025-01-15"),
      });
      const maintenanceProperty = Property.create({
        id: "property-3",
        title: "Maintenance Property",
        description: "A property under maintenance",
        address: Address.create("789 Pine St"),
        pricePerNight: Price.create(200),
        imageUrl: "/uploads/image3.jpg",
        ownerId: "owner-3",
        status: PropertyStatus.MAINTENANCE,
        createdAt: new Date("2025-01-30"),
      });

      const result = toPropertyListResponseDto([
        availableProperty,
        rentedProperty,
        maintenanceProperty,
      ]);

      expect(result.properties[0].status).toBe(PropertyStatus.AVAILABLE);
      expect(result.properties[1].status).toBe(PropertyStatus.RENTED);
      expect(result.properties[2].status).toBe(PropertyStatus.MAINTENANCE);
    });

    it("should handle properties with and without images", () => {
      const propertyWithImage = mockProperty;
      const propertyWithoutImage = Property.create({
        id: "property-2",
        title: "Property Without Image",
        description: "A property without an image",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: null,
        ownerId: "owner-2",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyListResponseDto([
        propertyWithImage,
        propertyWithoutImage,
      ]);

      expect(result.properties[0].imageUrl).not.toBeNull();
      expect(result.properties[1].imageUrl).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("should handle property with very long title", () => {
      const longTitleProperty = Property.create({
        id: "property-456",
        title: "A".repeat(200),
        description: "A property with a very long title",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: "/uploads/image.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(longTitleProperty);

      expect(result.title).toHaveLength(200);
    });

    it("should handle property with very long description", () => {
      const longDescProperty = Property.create({
        id: "property-456",
        title: "Property With Long Description",
        description: "B".repeat(5000),
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(150),
        imageUrl: "/uploads/image.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(longDescProperty);

      expect(result.description).toHaveLength(5000);
    });

    it("should handle property with maximum price", () => {
      const maxPriceProperty = Property.create({
        id: "property-456",
        title: "Expensive Property",
        description: "A very expensive property",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(1000000),
        imageUrl: "/uploads/image.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(maxPriceProperty);

      expect(result.pricePerNight).toBe(1000000);
    });

    it("should handle property with minimum price", () => {
      const minPriceProperty = Property.create({
        id: "property-456",
        title: "Free Property",
        description: "A free property",
        address: Address.create("456 Oak Street"),
        pricePerNight: Price.create(0),
        imageUrl: "/uploads/image.jpg",
        ownerId: "owner-456",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-15"),
      });

      const result = toPropertyResponseDto(minPriceProperty);

      expect(result.pricePerNight).toBe(0);
    });
  });
});
