import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetPropertyByIdUseCase } from "../application/get-property-by-id.use-case";
import { IPropertyRepository, Property } from "@repo/shared";
import { PropertyNotFoundError } from "@repo/shared";
import { PropertyFactory } from "./factories/property.factory";

describe("GetPropertyByIdUseCase", () => {
  let getPropertyByIdUseCase: GetPropertyByIdUseCase;
  let mockPropertyRepository: IPropertyRepository;

  beforeEach(() => {
    mockPropertyRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as IPropertyRepository;

    getPropertyByIdUseCase = new GetPropertyByIdUseCase(mockPropertyRepository);
  });

  describe("execute", () => {
    it("should return property when found", async () => {
      const property = PropertyFactory.create({ id: "property-123" });

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);

      const result = await getPropertyByIdUseCase.execute("property-123");

      expect(result).toEqual(property);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith("property-123");
    });

    it("should throw PropertyNotFoundError when property does not exist", async () => {
      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(null);

      await expect(getPropertyByIdUseCase.execute("non-existent")).rejects.toThrow(PropertyNotFoundError);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith("non-existent");
    });

    it("should propagate repository errors", async () => {
      vi.mocked(mockPropertyRepository.findById).mockRejectedValue(new Error("Database error"));

      await expect(getPropertyByIdUseCase.execute("property-123")).rejects.toThrow("Database error");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string id", async () => {
      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(null);

      await expect(getPropertyByIdUseCase.execute("")).rejects.toThrow(PropertyNotFoundError);
    });

    it("should pass id exactly as provided", async () => {
      const specialId = "property-123-abc-!@#$%";
      const property = PropertyFactory.create({ id: specialId });

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);

      const result = await getPropertyByIdUseCase.execute(specialId);

      expect(result.id).toBe(specialId);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(specialId);
    });
  });
});
