import { describe, it, expect, beforeEach } from "vitest";
import { Property } from "../property.entity";
import { Address } from "../../value-objects/address.vo";
import { Price } from "../../value-objects/price.vo";
import { PropertyStatus } from "../property-status.enum";
import { ValueError } from "../../errors/value.error";

describe("Property Entity", () => {
  describe("Creation", () => {
    it("should create property with valid data", () => {
      const property = Property.create({
        title: "Beautiful Beach House",
        description: "A stunning beachfront property with ocean views",
        address: Address.create("123 Ocean Drive, Miami, FL"),
        pricePerNight: Price.create(250),
        ownerId: "owner-123",
      });

      expect(property.id).toBeDefined();
      expect(property.getTitle()).toBe("Beautiful Beach House");
      expect(property.getDescription()).toBe("A stunning beachfront property with ocean views");
      expect(property.isAvailable()).toBe(true);
      expect(property.ownerId).toBe("owner-123");
    });

    it("should generate UUID if not provided", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.id).toBeDefined();
      expect(typeof property.id).toBe("string");
      expect(property.id.length).toBeGreaterThan(0);
    });

    it("should use provided id", () => {
      const property = Property.create({
        id: "property-123",
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.id).toBe("property-123");
    });

    it("should default to AVAILABLE status", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.status).toBe(PropertyStatus.AVAILABLE);
      expect(property.isAvailable()).toBe(true);
    });

    it("should accept custom status", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
        status: PropertyStatus.MAINTENANCE,
      });

      expect(property.status).toBe(PropertyStatus.MAINTENANCE);
      expect(property.isAvailable()).toBe(false);
    });

    it("should handle null imageUrl", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
        imageUrl: null,
      });

      expect(property.getImageUrl()).toBeNull();
    });

    it("should handle undefined imageUrl (defaults to null)", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.getImageUrl()).toBeNull();
    });

    it("should handle provided imageUrl", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
        imageUrl: "https://example.com/image.jpg",
      });

      expect(property.getImageUrl()).toBe("https://example.com/image.jpg");
    });
  });

  describe("Title validation", () => {
    it("should throw error if title is too short (< 3 chars)", () => {
      expect(() => {
        Property.create({
          title: "x",
          description: "Test description",
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).toThrow(ValueError);
    });

    it("should throw error if title is too short (2 chars)", () => {
      expect(() => {
        Property.create({
          title: "x".repeat(2),
          description: "Test description",
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).toThrow("Title must be at least 3 characters long");
    });

    it("should accept title with exactly 3 characters", () => {
      expect(() => {
        Property.create({
          title: "ABC",
          description: "Test description",
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).not.toThrow();
    });

    it("should throw error if title is too long (> 200 chars)", () => {
      expect(() => {
        Property.create({
          title: "A".repeat(201),
          description: "Test description",
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).toThrow(ValueError);
    });

    it("should accept title with exactly 200 characters", () => {
      expect(() => {
        Property.create({
          title: "A".repeat(200),
          description: "Test description",
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).not.toThrow();
    });

    it("should trim whitespace from title", () => {
      const property = Property.create({
        title: "  Beautiful Beach House  ",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.getTitle()).toBe("Beautiful Beach House");
    });
  });

  describe("Description validation", () => {
    it("should throw error if description is too short (< 10 chars)", () => {
      expect(() => {
        Property.create({
          title: "Test Property",
          description: "Short",
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).toThrow(ValueError);
    });

    it("should throw error if description is too short (9 chars)", () => {
      expect(() => {
        Property.create({
          title: "Test Property",
          description: "x".repeat(9),
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).toThrow("Description must be at least 10 characters long");
    });

    it("should accept description with exactly 10 characters", () => {
      expect(() => {
        Property.create({
          title: "Test Property",
          description: "x".repeat(10),
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).not.toThrow();
    });

    it("should throw error if description is too long (> 5000 chars)", () => {
      expect(() => {
        Property.create({
          title: "Test Property",
          description: "A".repeat(5001),
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).toThrow(ValueError);
    });

    it("should accept description with exactly 5000 characters", () => {
      expect(() => {
        Property.create({
          title: "Test Property",
          description: "A".repeat(5000),
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).not.toThrow();
    });

    it("should trim whitespace from description", () => {
      const property = Property.create({
        title: "Test Property",
        description: "  A stunning beachfront property  ",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.getDescription()).toBe("A stunning beachfront property");
    });
  });

  describe("Update methods", () => {
    let property: Property;

    beforeEach(() => {
      property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });
    });

    it("should update title", () => {
      property.updateTitle("New Title");
      expect(property.getTitle()).toBe("New Title");
    });

    it("should validate title on update", () => {
      expect(() => {
        property.updateTitle("x");
      }).toThrow(ValueError);
    });

    it("should update description", () => {
      property.updateDescription("New description for the property");
      expect(property.getDescription()).toBe("New description for the property");
    });

    it("should validate description on update", () => {
      expect(() => {
        property.updateDescription("Short");
      }).toThrow(ValueError);
    });

    it("should update address", () => {
      const newAddress = Address.create("456 New St, City");
      property.updateAddress(newAddress);
      expect(property.getAddress()).toEqual(newAddress);
    });

    it("should update price", () => {
      const newPrice = Price.create(250);
      property.updatePrice(newPrice);
      expect(property.getPricePerNight()).toEqual(newPrice);
      expect(property.getPricePerNight().toNumber()).toBe(250);
    });

    it("should update imageUrl", () => {
      property.updateImageUrl("https://example.com/new-image.jpg");
      expect(property.getImageUrl()).toBe("https://example.com/new-image.jpg");
    });

    it("should update imageUrl to null", () => {
      property.updateImageUrl(null);
      expect(property.getImageUrl()).toBeNull();
    });
  });

  describe("Status methods", () => {
    let property: Property;

    beforeEach(() => {
      property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });
    });

    it("should mark as available", () => {
      property.markAsAvailable();
      expect(property.isAvailable()).toBe(true);
      expect(property.status).toBe(PropertyStatus.AVAILABLE);
    });

    it("should mark as rented", () => {
      property.markAsRented();
      expect(property.isAvailable()).toBe(false);
      expect(property.status).toBe(PropertyStatus.RENTED);
    });

    it("should mark as maintenance", () => {
      property.markAsMaintenance();
      expect(property.isAvailable()).toBe(false);
      expect(property.status).toBe(PropertyStatus.MAINTENANCE);
    });

    it("should mark as inactive", () => {
      property.markAsInactive();
      expect(property.isAvailable()).toBe(false);
      expect(property.status).toBe(PropertyStatus.INACTIVE);
    });
  });

  describe("Getters", () => {
    it("should return title", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.getTitle()).toBe("Test Property");
    });

    it("should return description", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.getDescription()).toBe("Test description");
    });

    it("should return address", () => {
      const address = Address.create("123 Test St");
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address,
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
      });

      expect(property.getAddress()).toEqual(address);
    });

    it("should return price", () => {
      const price = Price.create(150);
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: price,
        ownerId: "owner-123",
      });

      expect(property.getPricePerNight()).toEqual(price);
      expect(property.getPricePerNight().toNumber()).toBe(150);
    });
  });

  describe("toJSON", () => {
    it("should serialize property correctly", () => {
      const address = Address.create("123 Ocean Drive, Miami, FL");
      const price = Price.create(250);

      const property = Property.create({
        id: "property-123",
        title: "Beautiful Beach House",
        description: "A stunning beachfront property",
        address,
        pricePerNight: price,
        ownerId: "owner-123",
        imageUrl: "https://example.com/image.jpg",
        status: PropertyStatus.AVAILABLE,
        createdAt: new Date("2025-01-01"),
      });

      const json = property.toJSON();

      expect(json).toEqual({
        id: "property-123",
        title: "Beautiful Beach House",
        description: "A stunning beachfront property",
        address: address.toString(),
        pricePerNight: price.toNumber(),
        imageUrl: "https://example.com/image.jpg",
        ownerId: "owner-123",
        status: PropertyStatus.AVAILABLE,
        createdAt: property.createdAt,
      });
    });

    it("should serialize property with null imageUrl", () => {
      const property = Property.create({
        title: "Test Property",
        description: "Test description",
        address: Address.create("123 Test St"),
        pricePerNight: Price.create(100),
        ownerId: "owner-123",
        imageUrl: null,
      });

      const json = property.toJSON();

      expect(json.imageUrl).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("should handle title with only spaces after trim", () => {
      expect(() => {
        Property.create({
          title: "   ",
          description: "Test description",
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).toThrow(ValueError);
    });

    it("should handle description with only spaces after trim", () => {
      expect(() => {
        Property.create({
          title: "Test Property",
          description: "          ",
          address: Address.create("123 Test St"),
          pricePerNight: Price.create(100),
          ownerId: "owner-123",
        });
      }).toThrow(ValueError);
    });
  });
});
