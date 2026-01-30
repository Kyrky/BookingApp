import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeletePropertyUseCase } from "../application/delete-property.use-case";
import { IPropertyRepository, PropertyNotFoundError } from "@repo/shared";
import { PropertyFactory } from "./factories/property.factory";

describe("DeletePropertyUseCase", () => {
    let deletePropertyUseCase: DeletePropertyUseCase;
    let mockPropertyRepository: IPropertyRepository;

    beforeEach(() => {
        mockPropertyRepository = {
            findAll: vi.fn(),
            findById: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
        } as unknown as IPropertyRepository;

        deletePropertyUseCase = new DeletePropertyUseCase(mockPropertyRepository);
    });

    describe("execute", () => {
        it("should successfully delete a property", async () => {
            const property = PropertyFactory.create();

            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
            vi.mocked(mockPropertyRepository.delete).mockResolvedValue(undefined);

            await deletePropertyUseCase.execute(property.id);

            expect(mockPropertyRepository.findById).toHaveBeenCalledWith(property.id);
            expect(mockPropertyRepository.delete).toHaveBeenCalledWith(property.id);
        });

        it("should throw PropertyNotFoundError if property does not exist", async () => {
            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(null);

            await expect(
                deletePropertyUseCase.execute("non-existent")
            ).rejects.toThrow(PropertyNotFoundError);

            expect(mockPropertyRepository.delete).not.toHaveBeenCalled();
        });

        it("should propagate repository errors", async () => {
            const property = PropertyFactory.create();

            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
            vi.mocked(mockPropertyRepository.delete).mockRejectedValue(new Error("Database error"));

            await expect(deletePropertyUseCase.execute(property.id)).rejects.toThrow("Database error");
        });
    });
});
