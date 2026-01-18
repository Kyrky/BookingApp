import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { toCreatePropertyInput, toUpdatePropertyInput } from "../property-dto.mapper";
import { CreatePropertyDto, UpdatePropertyDto } from "@repo/dto";
import { Address, Price } from "@repo/shared";

describe("property-dto.mapper", () => {
  let mockCreateDto: CreatePropertyDto;

  beforeEach(() => {
    mockCreateDto = {
      title: "New Property",
      description: "A beautiful new property",
      address: "123 Oak Street",
      pricePerNight: 150,
      imageUrl: "https://example.com/image.jpg",
      ownerId: "owner-123",
    };
  });

  describe("toCreatePropertyInput", () => {
    it("should map CreatePropertyDto to domain input", () => {
      const result = toCreatePropertyInput(mockCreateDto);

      expect(result).toEqual({
        title: "New Property",
        description: "A beautiful new property",
        address: expect.any(Address),
        pricePerNight: expect.any(Price),
        imageUrl: "https://example.com/image.jpg",
        ownerId: "owner-123",
      });
    });

    it("should create Address value object from string", () => {
      const result = toCreatePropertyInput(mockCreateDto);

      expect(result.address).toBeInstanceOf(Address);
      expect(result.address.toString()).toBe("123 Oak Street");
    });

    it("should create Price value object from number", () => {
      const result = toCreatePropertyInput(mockCreateDto);

      expect(result.pricePerNight).toBeInstanceOf(Price);
      expect(result.pricePerNight.toNumber()).toBe(150);
    });

    it("should handle null imageUrl", () => {
      const dtoWithNullImage = {
        ...mockCreateDto,
        imageUrl: null,
      };

      const result = toCreatePropertyInput(dtoWithNullImage);

      expect(result.imageUrl).toBeNull();
    });

    it("should handle undefined imageUrl", () => {
      const dtoWithUndefinedImage = {
        ...mockCreateDto,
        imageUrl: undefined,
      };

      const result = toCreatePropertyInput(dtoWithUndefinedImage);

      expect(result.imageUrl).toBeUndefined();
    });

    it("should handle various price values", () => {
      const lowPriceDto = { ...mockCreateDto, pricePerNight: 50 };
      const lowPriceResult = toCreatePropertyInput(lowPriceDto);
      expect(lowPriceResult.pricePerNight.toNumber()).toBe(50);

      const highPriceDto = { ...mockCreateDto, pricePerNight: 10000 };
      const highPriceResult = toCreatePropertyInput(highPriceDto);
      expect(highPriceResult.pricePerNight.toNumber()).toBe(10000);
    });

    it("should handle different address formats", () => {
      const shortAddressDto = { ...mockCreateDto, address: "123 Main St" };
      const shortAddressResult = toCreatePropertyInput(shortAddressDto);
      expect(shortAddressResult.address.toString()).toBe("123 Main St");

      const longAddressDto = {
        ...mockCreateDto,
        address: "1234 Very Long Street Name, Apt 5B, New York, NY 10001, USA",
      };
      const longAddressResult = toCreatePropertyInput(longAddressDto);
      expect(longAddressResult.address.toString()).toBe(
        "1234 Very Long Street Name, Apt 5B, New York, NY 10001, USA"
      );
    });
  });

  describe("toUpdatePropertyInput", () => {
    it("should map UpdatePropertyDto with all fields", () => {
      const updateDto: UpdatePropertyDto = {
        title: "Updated Property",
        description: "Updated description",
        pricePerNight: 200,
        address: "456 Pine Avenue",
        imageUrl: "https://example.com/new-image.jpg",
      };

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toEqual({
        title: "Updated Property",
        description: "Updated description",
        pricePerNight: expect.any(Price),
        address: expect.any(Address),
        imageUrl: "https://example.com/new-image.jpg",
      });
    });

    it("should map UpdatePropertyDto with only title", () => {
      const updateDto: UpdatePropertyDto = {
        title: "Updated Property",
      };

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toEqual({
        title: "Updated Property",
      });
      expect(result).not.toHaveProperty("description");
      expect(result).not.toHaveProperty("pricePerNight");
      expect(result).not.toHaveProperty("address");
      expect(result).not.toHaveProperty("imageUrl");
    });

    it("should map UpdatePropertyDto with only description", () => {
      const updateDto: UpdatePropertyDto = {
        description: "Updated description",
      };

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toEqual({
        description: "Updated description",
      });
    });

    it("should map UpdatePropertyDto with only pricePerNight", () => {
      const updateDto: UpdatePropertyDto = {
        pricePerNight: 250,
      };

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toEqual({
        pricePerNight: expect.any(Price),
      });
      expect(result.pricePerNight).toBeInstanceOf(Price);
      expect(result.pricePerNight.toNumber()).toBe(250);
    });

    it("should map UpdatePropertyDto with only address", () => {
      const updateDto: UpdatePropertyDto = {
        address: "789 Elm Road",
      };

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toEqual({
        address: expect.any(Address),
      });
      expect(result.address).toBeInstanceOf(Address);
      expect(result.address.toString()).toBe("789 Elm Road");
    });

    it("should map UpdatePropertyDto with only imageUrl", () => {
      const updateDto: UpdatePropertyDto = {
        imageUrl: "https://example.com/updated.jpg",
      };

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toEqual({
        imageUrl: "https://example.com/updated.jpg",
      });
    });

    it("should handle empty object", () => {
      const updateDto: UpdatePropertyDto = {};

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toEqual({});
    });

    it("should handle null values in fields", () => {
      const updateDto: UpdatePropertyDto = {
        imageUrl: null,
      };

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toEqual({
        imageUrl: null,
      });
    });

    it("should handle partial updates with multiple fields", () => {
      const updateDto: UpdatePropertyDto = {
        title: "Updated Title",
        pricePerNight: 300,
      };

      const result = toUpdatePropertyInput(updateDto);

      expect(result).toHaveProperty("title", "Updated Title");
      expect(result).toHaveProperty("pricePerNight");
      expect(result).not.toHaveProperty("description");
      expect(result).not.toHaveProperty("address");
      expect(result).not.toHaveProperty("imageUrl");
    });
  });
});
