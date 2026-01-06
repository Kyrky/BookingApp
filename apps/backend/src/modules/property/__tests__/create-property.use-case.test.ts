import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreatePropertyUseCase } from "../application/create-property.use-case";
import { IPropertyRepository, Property, Address, Price } from "@repo/shared";
import { PropertyFactory } from "./factories/property.factory";

describe("CreatePropertyUseCase", () => {
  let createPropertyUseCase: CreatePropertyUseCase;
  let mockPropertyRepository: IPropertyRepository;

  beforeEach(() => {
    mockPropertyRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as IPropertyRepository;

    createPropertyUseCase = new CreatePropertyUseCase(mockPropertyRepository);
  });

  describe("execute", () => {
    const validInput = {
      title: "Beautiful Beach House",
      description: "A stunning beachfront property with ocean views",
      pricePerNight: 250,
      address: "123 Ocean Drive, Miami, FL",
      ownerId: "owner-123",
    };

    it("should successfully create a property", async () => {
      const property = PropertyFactory.create();

      vi.mocked(mockPropertyRepository.save).mockResolvedValue(property);

      const result = await createPropertyUseCase.execute(validInput);

      expect(result).toEqual(property);
      expect(mockPropertyRepository.save).toHaveBeenCalled();
    });

    it("should create property with imageUrl", async () => {
      const inputWithImage = {
        ...validInput,
        imageUrl: "https://example.com/image.jpg",
      };
      const property = PropertyFactory.create({
        imageUrl: inputWithImage.imageUrl,
      });

      vi.mocked(mockPropertyRepository.save).mockResolvedValue(property);

      const result = await createPropertyUseCase.execute(inputWithImage);

      expect(result).toEqual(property);
    });

    it("should create property with null imageUrl", async () => {
      const inputWithNullImage = {
        ...validInput,
        imageUrl: null,
      };
      const property = PropertyFactory.create({
        imageUrl: null,
      });

      vi.mocked(mockPropertyRepository.save).mockResolvedValue(property);

      const result = await createPropertyUseCase.execute(inputWithNullImage);

      expect(result).toEqual(property);
    });

    it("should create Address and Price value objects", async () => {
      const property = PropertyFactory.create();

      vi.mocked(mockPropertyRepository.save).mockImplementation((prop) => Promise.resolve(prop));

      await createPropertyUseCase.execute(validInput);

      const saveCall = vi.mocked(mockPropertyRepository.save).mock.calls[0];
      const savedProperty = saveCall![0] as Property;

      expect(savedProperty.getPricePerNight()).toBeInstanceOf(Price);
      expect(savedProperty.getPricePerNight().toNumber()).toBe(validInput.pricePerNight);
      expect(savedProperty.getAddress()).toBeInstanceOf(Address);
    });

    it("should propagate repository errors", async () => {
      vi.mocked(mockPropertyRepository.save).mockRejectedValue(new Error("Database error"));

      await expect(createPropertyUseCase.execute(validInput)).rejects.toThrow("Database error");
    });
  });

  describe("Input validation", () => {
    it("should handle Address creation errors", async () => {
      const invalidInput = {
        title: "Test",
        description: "Test description",
        pricePerNight: 100,
        address: "x",
        ownerId: "owner-123",
      };

      vi.mocked(mockPropertyRepository.save).mockImplementation((prop) => Promise.resolve(prop));

      await expect(createPropertyUseCase.execute(invalidInput)).rejects.toThrow();
      expect(mockPropertyRepository.save).not.toHaveBeenCalled();
    });

    it("should handle Price creation errors", async () => {
      const invalidInput = {
        title: "Test",
        description: "Test description",
        pricePerNight: -1,
        address: "123 Test St, City",
        ownerId: "owner-123",
      };

      vi.mocked(mockPropertyRepository.save).mockImplementation((prop) => Promise.resolve(prop));

      await expect(createPropertyUseCase.execute(invalidInput)).rejects.toThrow();
      expect(mockPropertyRepository.save).not.toHaveBeenCalled();
    });

    it("should handle Property creation errors for invalid title", async () => {
      const invalidInput = {
        title: "x",
        description: "Test description",
        pricePerNight: 100,
        address: "123 Test St, City",
        ownerId: "owner-123",
      };

      vi.mocked(mockPropertyRepository.save).mockImplementation((prop) => Promise.resolve(prop));

      await expect(createPropertyUseCase.execute(invalidInput)).rejects.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle very long title", async () => {
      const input = {
        title: "A".repeat(200),
        description: "A lovely test property located in a great area",
        pricePerNight: 100,
        address: "123 Test St, City",
        ownerId: "owner-123",
      };
      const property = PropertyFactory.create({ title: input.title });

      vi.mocked(mockPropertyRepository.save).mockResolvedValue(property);

      const result = await createPropertyUseCase.execute(input);

      expect(result.getTitle()).toBe(input.title);
    });

    it("should handle very long description", async () => {
      const input = {
        title: "Test Property",
        description: "A".repeat(5000),
        pricePerNight: 100,
        address: "123 Test St, City",
        ownerId: "owner-123",
      };
      const property = PropertyFactory.create({ description: input.description });

      vi.mocked(mockPropertyRepository.save).mockResolvedValue(property);

      const result = await createPropertyUseCase.execute(input);

      expect(result.getDescription()).toBe(input.description);
    });
  });
});
