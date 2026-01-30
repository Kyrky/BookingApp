import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetBookingsUseCase } from "../application/get-bookings.use-case";
import { IBookingRepository, Booking } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("GetBookingsUseCase", () => {
    let getBookingsUseCase: GetBookingsUseCase;
    let mockBookingRepository: IBookingRepository;

    beforeEach(() => {
        mockBookingRepository = {
            findAll: vi.fn(),
            findById: vi.fn(),
            findByUserId: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
        } as unknown as IBookingRepository;

        getBookingsUseCase = new GetBookingsUseCase(mockBookingRepository);
    });

    describe("execute", () => {
        it("should return an empty list if no bookings exist", async () => {
            vi.mocked(mockBookingRepository.findAll).mockResolvedValue([]);

            const result = await getBookingsUseCase.execute();

            expect(result).toEqual([]);
            expect(mockBookingRepository.findAll).toHaveBeenCalled();
        });

        it("should return all bookings", async () => {
            const bookings = [
                BookingFactory.create({ id: "booking-1" }),
                BookingFactory.create({ id: "booking-2" }),
            ];

            vi.mocked(mockBookingRepository.findAll).mockResolvedValue(bookings);

            const result = await getBookingsUseCase.execute();

            expect(result).toHaveLength(2);
            expect(result).toEqual(bookings);
        });

        it("should propagate repository errors", async () => {
            vi.mocked(mockBookingRepository.findAll).mockRejectedValue(new Error("Database error"));

            await expect(getBookingsUseCase.execute()).rejects.toThrow("Database error");
        });
    });
});
