import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetPropertiesUseCase } from "../application/get-properties.use-case";
import { IPropertyRepository, Property } from "@repo/shared";
import { PropertyFactory } from "./factories/property.factory";

describe("GetPropertiesUseCase", () => {
  let getPropertiesUseCase: GetPropertiesUseCase;
  let mockPropertyRepository: IPropertyRepository;

  beforeEach(() => {
    mockPropertyRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as IPropertyRepository;

    getPropertiesUseCase = new GetPropertiesUseCase(mockPropertyRepository);
  });

  describe("execute", () => {
    it("should return all properties", async () => {
      const properties = [
        PropertyFactory.create({ id: "property-1" }),
        PropertyFactory.create({ id: "property-2" }),
        PropertyFactory.create({ id: "property-3" }),
      ];

      vi.mocked(mockPropertyRepository.findAll).mockResolvedValue(properties);

      const result = await getPropertiesUseCase.execute();

      expect(result).toEqual(properties);
      expect(result).toHaveLength(3);
      expect(mockPropertyRepository.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no properties exist", async () => {
      vi.mocked(mockPropertyRepository.findAll).mockResolvedValue([]);

      const result = await getPropertiesUseCase.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should propagate repository errors", async () => {
      vi.mocked(mockPropertyRepository.findAll).mockRejectedValue(new Error("Database error"));

      await expect(getPropertiesUseCase.execute()).rejects.toThrow("Database error");
    });

    it("should return properties in the order returned by repository", async () => {
      const properties = [
        PropertyFactory.create({ id: "property-3" }),
        PropertyFactory.create({ id: "property-1" }),
        PropertyFactory.create({ id: "property-2" }),
      ];

      vi.mocked(mockPropertyRepository.findAll).mockResolvedValue(properties);

      const result = await getPropertiesUseCase.execute();

      expect(result[0].id).toBe("property-3");
      expect(result[1].id).toBe("property-1");
      expect(result[2].id).toBe("property-2");
    });
  });

  describe("Edge cases", () => {
    it("should handle large number of properties", async () => {
      const properties = Array.from({ length: 100 }, (_, i) =>
        PropertyFactory.create({ id: `property-${i}` })
      );

      vi.mocked(mockPropertyRepository.findAll).mockResolvedValue(properties);

      const result = await getPropertiesUseCase.execute();

      expect(result).toHaveLength(100);
    });

    it("should handle single property", async () => {
      const properties = [PropertyFactory.create()];

      vi.mocked(mockPropertyRepository.findAll).mockResolvedValue(properties);

      const result = await getPropertiesUseCase.execute();

      expect(result).toHaveLength(1);
    });
  });
});
