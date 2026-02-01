import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateBookingUseCase } from "../application/create-booking.use-case";
import { IBookingRepository, IPropertyRepository, Booking, PropertyNotFoundError, ValueError } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";
import { PropertyFactory } from "./factories/property.factory";

describe("CreateBookingUseCase", () => {
  let createBookingUseCase: CreateBookingUseCase;
  let mockBookingRepository: IBookingRepository;
  let mockPropertyRepository: IPropertyRepository;

  beforeEach(() => {
    mockBookingRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByPropertyId: vi.fn(),
      findActiveByPropertyId: vi.fn(),
      findOverlappingBookings: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as IBookingRepository;

    mockPropertyRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as IPropertyRepository;

    createBookingUseCase = new CreateBookingUseCase(mockBookingRepository, mockPropertyRepository);
  });

  describe("execute", () => {
    const validInput = {
      propertyId: "property-123",
      userId: "user-123",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-02-05"),
      totalGuests: 2,
    };

    it("should successfully create booking", async () => {
      const property = PropertyFactory.withPrice(100);
      const booking = BookingFactory.create();

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      const result = await createBookingUseCase.execute(validInput);

      expect(result).toBe(booking);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(validInput.propertyId);
      expect(mockBookingRepository.findOverlappingBookings).toHaveBeenCalledWith(
        validInput.propertyId,
        validInput.startDate,
        validInput.endDate
      );
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it("should throw PropertyNotFoundError when property does not exist", async () => {
      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(null);

      await expect(createBookingUseCase.execute(validInput)).rejects.toThrow(PropertyNotFoundError);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(validInput.propertyId);
      expect(mockBookingRepository.findOverlappingBookings).not.toHaveBeenCalled();
    });

    it("should throw ValueError when dates overlap", async () => {
      const property = PropertyFactory.create();
      const overlappingBookings = [BookingFactory.create()];

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue(overlappingBookings);

      await expect(createBookingUseCase.execute(validInput)).rejects.toThrow(
        "Property is not available for the selected dates"
      );
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should calculate total price correctly (4 days * $100 = $400)", async () => {
      const property = PropertyFactory.withPrice(100);
      const savedBooking = BookingFactory.create({ totalPrice: 400 });

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockImplementation((booking) => Promise.resolve(booking));

      const result = await createBookingUseCase.execute(validInput);

      expect(result.totalPrice).toBe(400);
    });

    it("should calculate total price correctly (1 day * $150 = $150)", async () => {
      const property = PropertyFactory.withPrice(150);
      const input = {
        ...validInput,
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-02"),
      };

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockImplementation((booking) => Promise.resolve(booking));

      const result = await createBookingUseCase.execute(input);

      expect(result.totalPrice).toBe(150);
    });

    it("should calculate total price correctly (10 days * $200 = $2000)", async () => {
      const property = PropertyFactory.withPrice(200);
      const input = {
        ...validInput,
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-11"),
      };

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockImplementation((booking) => Promise.resolve(booking));

      const result = await createBookingUseCase.execute(input);

      expect(result.totalPrice).toBe(2000);
    });

    it("should use exact dates provided", async () => {
      const property = PropertyFactory.create();
      const booking = BookingFactory.create();

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      await createBookingUseCase.execute(validInput);

      const saveCall = vi.mocked(mockBookingRepository.save).mock.calls[0];
      expect(saveCall![0].startDate).toEqual(validInput.startDate);
      expect(saveCall![0].endDate).toEqual(validInput.endDate);
    });

    it("should preserve userId and propertyId in booking", async () => {
      const property = PropertyFactory.create();
      const booking = BookingFactory.create();

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      await createBookingUseCase.execute(validInput);

      const saveCall = vi.mocked(mockBookingRepository.save).mock.calls[0];
      expect(saveCall![0].userId).toBe(validInput.userId);
      expect(saveCall![0].propertyId).toBe(validInput.propertyId);
    });

    it("should preserve totalGuests in booking", async () => {
      const property = PropertyFactory.create();
      const booking = BookingFactory.create();

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      await createBookingUseCase.execute(validInput);

      const saveCall = vi.mocked(mockBookingRepository.save).mock.calls[0];
      expect(saveCall![0].totalGuests).toBe(validInput.totalGuests);
    });
  });

  describe("Edge cases", () => {
    it("should handle partial day bookings", async () => {
      const property = PropertyFactory.withPrice(100);
      const input = {
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01T10:00:00"),
        endDate: new Date("2025-02-02T06:00:00"),
        totalGuests: 2,
      };

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockImplementation((booking) => Promise.resolve(booking));

      const result = await createBookingUseCase.execute(input);

      expect(result.totalPrice).toBe(100);
    });

    it("should handle repository errors gracefully", async () => {
      vi.mocked(mockPropertyRepository.findById).mockRejectedValue(new Error("Database error"));

      await expect(createBookingUseCase.execute({
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
      })).rejects.toThrow("Database error");
    });

    it("should handle booking repository errors", async () => {
      const property = PropertyFactory.create();

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockRejectedValue(new Error("Save failed"));

      await expect(createBookingUseCase.execute({
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
      })).rejects.toThrow("Save failed");
    });
  });

  describe("Date calculation accuracy", () => {
    it("should calculate exact number of days for week-long booking", async () => {
      const property = PropertyFactory.withPrice(100);
      const input = {
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-08"),
        totalGuests: 2,
      };

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockImplementation((booking) => Promise.resolve(booking));

      const result = await createBookingUseCase.execute(input);

      expect(result.totalPrice).toBe(700);
    });

    it("should handle month boundary", async () => {
      const property = PropertyFactory.withPrice(100);
      const input = {
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-01-30"),
        endDate: new Date("2025-02-02"),
        totalGuests: 2,
      };

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockImplementation((booking) => Promise.resolve(booking));

      const result = await createBookingUseCase.execute(input);

      expect(result.totalPrice).toBe(300);
    });
  });

  describe("Overlapping bookings detection", () => {
    it("should allow booking when no overlapping bookings exist", async () => {
      const property = PropertyFactory.create();
      const booking = BookingFactory.create();

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([]);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      await expect(createBookingUseCase.execute({
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
      })).resolves.toBeDefined();
    });

    it("should reject booking when overlapping bookings exist", async () => {
      const property = PropertyFactory.create();
      const overlappingBooking = BookingFactory.create();

      vi.mocked(mockPropertyRepository.findById).mockResolvedValue(property);
      vi.mocked(mockBookingRepository.findOverlappingBookings).mockResolvedValue([overlappingBooking]);

      await expect(createBookingUseCase.execute({
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
      })).rejects.toThrow("Property is not available for the selected dates");
    });
  });
});
