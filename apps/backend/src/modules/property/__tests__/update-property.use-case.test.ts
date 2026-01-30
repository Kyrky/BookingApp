import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdatePropertyUseCase } from "../application/update-property.use-case";
import { IPropertyRepository, Property, Address, Price, PropertyNotFoundError } from "@repo/shared";
import { PropertyFactory } from "./factories/property.factory";

describe("UpdatePropertyUseCase", () => {
    let updatePropertyUseCase: UpdatePropertyUseCase;
    let mockPropertyRepository: IPropertyRepository;

    beforeEach(() => {
        mockPropertyRepository = {
            findAll: vi.fn(),
            findById: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
        } as unknown as IPropertyRepository;

        updatePropertyUseCase = new UpdatePropertyUseCase(mockPropertyRepository);
    });

    describe("execute", () => {
        it("should successfully update all property fields", async () => {
            const property = PropertyFactory.create();
            const input = {
                title: "Updated Title",
                description: "Updated Description",
                pricePerNight: 500,
                address: "456 New St, New City",
                imageUrl: "https://example.com/new-image.jpg",
            };

            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
            vi.mocked(mockPropertyRepository.save).mockImplementation((prop) => Promise.resolve(prop));

            const result = await updatePropertyUseCase.execute(property.id, input);

            expect(result.getTitle()).toBe(input.title);
            expect(result.getDescription()).toBe(input.description);
            expect(result.getPricePerNight().toNumber()).toBe(input.pricePerNight);
            expect(result.getAddress().toString()).toBe(input.address);
            expect(result.getImageUrl()).toBe(input.imageUrl);
            expect(mockPropertyRepository.save).toHaveBeenCalledWith(property);
        });

        it("should partially update property fields", async () => {
            const property = PropertyFactory.create({ title: "Original Title" });
            const input = {
                title: "Updated Title",
            };

            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
            vi.mocked(mockPropertyRepository.save).mockImplementation((prop) => Promise.resolve(prop));

            const result = await updatePropertyUseCase.execute(property.id, input);

            expect(result.getTitle()).toBe(input.title);
            expect(result.getDescription()).toBe(property.getDescription()); // Unchanged
            expect(mockPropertyRepository.save).toHaveBeenCalled();
        });

        it("should update imageUrl to null", async () => {
            const property = PropertyFactory.create({ imageUrl: "https://example.com/old.jpg" });
            const input = {
                imageUrl: null,
            };

            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
            vi.mocked(mockPropertyRepository.save).mockImplementation((prop) => Promise.resolve(prop));

            const result = await updatePropertyUseCase.execute(property.id, input);

            expect(result.getImageUrl()).toBeNull();
            expect(mockPropertyRepository.save).toHaveBeenCalled();
        });

        it("should throw PropertyNotFoundError if property does not exist", async () => {
            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(null);

            await expect(
                updatePropertyUseCase.execute("non-existent", { title: "New Title" })
            ).rejects.toThrow(PropertyNotFoundError);

            expect(mockPropertyRepository.save).not.toHaveBeenCalled();
        });

        it("should handle Price creation errors for invalid price", async () => {
            const property = PropertyFactory.create();
            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);

            await expect(
                updatePropertyUseCase.execute(property.id, { pricePerNight: -100 })
            ).rejects.toThrow();

            expect(mockPropertyRepository.save).not.toHaveBeenCalled();
        });

        it("should handle Address creation errors for invalid address", async () => {
            const property = PropertyFactory.create();
            vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);

            await expect(
                updatePropertyUseCase.execute(property.id, { address: "" }) // Assuming empty address is invalid
            ).rejects.toThrow();

            expect(mockPropertyRepository.save).not.toHaveBeenCalled();
        });
    });
});
