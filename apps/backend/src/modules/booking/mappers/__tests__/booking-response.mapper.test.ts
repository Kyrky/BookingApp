import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { toBookingResponseDto, toBookingListResponseDto } from "../booking-response.mapper";
import { Booking, BookingStatus } from "@repo/shared";
import { Property, User } from "@repo/database";

describe("booking-response.mapper", () => {
  let mockBooking: Booking;
  let mockProperty: Property;
  let mockUser: User;

  beforeEach(() => {
    mockBooking = Booking.create({
      id: "booking-123",
      propertyId: "property-123",
      userId: "user-123",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-02-05"),
      totalGuests: 2,
      totalPrice: 500,
      status: BookingStatus.PENDING,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    });

    mockProperty = {
      id: "property-123",
      title: "Test Property",
      address: "123 Test St",
      imageUrl: "https://example.com/image.jpg",
      pricePerNight: 100,
      ownerId: "owner-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUser = {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hash",
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("toBookingResponseDto", () => {
    it("should map booking to response dto without relations", () => {
      const result = toBookingResponseDto(mockBooking);

      expect(result).toEqual({
        id: "booking-123",
        propertyId: "property-123",
        userId: "user-123",
        startDate: mockBooking.startDate,
        endDate: mockBooking.endDate,
        totalGuests: 2,
        totalPrice: 500,
        status: BookingStatus.PENDING,
        createdAt: mockBooking.createdAt,
        updatedAt: mockBooking.updatedAt,
        days: 4,
      });
    });

    it("should map booking with property relation", () => {
      const result = toBookingResponseDto(mockBooking, mockProperty);

      expect(result).toEqual({
        id: "booking-123",
        propertyId: "property-123",
        userId: "user-123",
        startDate: mockBooking.startDate,
        endDate: mockBooking.endDate,
        totalGuests: 2,
        totalPrice: 500,
        status: BookingStatus.PENDING,
        createdAt: mockBooking.createdAt,
        updatedAt: mockBooking.updatedAt,
        days: 4,
        property: {
          id: "property-123",
          title: "Test Property",
          address: "123 Test St",
          imageUrl: "https://example.com/image.jpg",
          pricePerNight: 100,
        },
      });
    });

    it("should map booking with user relation", () => {
      const result = toBookingResponseDto(mockBooking, null, mockUser);

      expect(result).toEqual({
        id: "booking-123",
        propertyId: "property-123",
        userId: "user-123",
        startDate: mockBooking.startDate,
        endDate: mockBooking.endDate,
        totalGuests: 2,
        totalPrice: 500,
        status: BookingStatus.PENDING,
        createdAt: mockBooking.createdAt,
        updatedAt: mockBooking.updatedAt,
        days: 4,
        user: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
        },
      });
    });

    it("should map booking with both property and user relations", () => {
      const result = toBookingResponseDto(mockBooking, mockProperty, mockUser);

      expect(result).toHaveProperty("property");
      expect(result).toHaveProperty("user");
      expect(result.property).toEqual({
        id: "property-123",
        title: "Test Property",
        address: "123 Test St",
        imageUrl: "https://example.com/image.jpg",
        pricePerNight: 100,
      });
      expect(result.user).toEqual({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
      });
    });

    it("should handle null imageUrl in property", () => {
      const propertyWithNullImage = { ...mockProperty, imageUrl: null };
      const result = toBookingResponseDto(mockBooking, propertyWithNullImage);

      expect(result.property).toHaveProperty("imageUrl", null);
    });

    it("should calculate days correctly for different date ranges", () => {
      const oneDayBooking = Booking.create({
        ...mockBooking.toJSON(),
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-02"),
      });
      expect(toBookingResponseDto(oneDayBooking).days).toBe(1);

      const weekBooking = Booking.create({
        ...mockBooking.toJSON(),
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-08"),
      });
      expect(toBookingResponseDto(weekBooking).days).toBe(7);
    });

    it("should handle different booking statuses", () => {
      const confirmedBooking = Booking.create({
        ...mockBooking.toJSON(),
        status: BookingStatus.CONFIRMED,
      });
      expect(toBookingResponseDto(confirmedBooking).status).toBe(BookingStatus.CONFIRMED);

      const cancelledBooking = Booking.create({
        ...mockBooking.toJSON(),
        status: BookingStatus.CANCELLED,
      });
      expect(toBookingResponseDto(cancelledBooking).status).toBe(BookingStatus.CANCELLED);

      const completedBooking = Booking.create({
        ...mockBooking.toJSON(),
        status: BookingStatus.COMPLETED,
      });
      expect(toBookingResponseDto(completedBooking).status).toBe(BookingStatus.COMPLETED);
    });
  });

  describe("toBookingListResponseDto", () => {
    it("should map empty array to empty list", () => {
      const result = toBookingListResponseDto([]);

      expect(result).toEqual({
        bookings: [],
        total: 0,
      });
    });

    it("should map single booking to list", () => {
      const result = toBookingListResponseDto([{ booking: mockBooking }]);

      expect(result).toEqual({
        bookings: [
          {
            id: "booking-123",
            propertyId: "property-123",
            userId: "user-123",
            startDate: mockBooking.startDate,
            endDate: mockBooking.endDate,
            totalGuests: 2,
            totalPrice: 500,
            status: BookingStatus.PENDING,
            createdAt: mockBooking.createdAt,
            updatedAt: mockBooking.updatedAt,
            days: 4,
          },
        ],
        total: 1,
      });
    });

    it("should map multiple bookings to list", () => {
      const booking2 = Booking.create({
        id: "booking-456",
        propertyId: "property-456",
        userId: "user-456",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-03-03"),
        totalGuests: 4,
        totalPrice: 300,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-15"),
      });

      const result = toBookingListResponseDto([
        { booking: mockBooking },
        { booking: booking2 },
      ]);

      expect(result.total).toBe(2);
      expect(result.bookings).toHaveLength(2);
      expect(result.bookings[0].id).toBe("booking-123");
      expect(result.bookings[1].id).toBe("booking-456");
    });

    it("should include relations when provided", () => {
      const result = toBookingListResponseDto([
        { booking: mockBooking, property: mockProperty, user: mockUser },
      ]);

      expect(result.bookings[0]).toHaveProperty("property");
      expect(result.bookings[0]).toHaveProperty("user");
      expect(result.total).toBe(1);
    });

    it("should handle mixed relations (some with, some without)", () => {
      const booking2 = Booking.create({
        id: "booking-456",
        propertyId: "property-456",
        userId: "user-456",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-03-03"),
        totalGuests: 4,
        totalPrice: 300,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-15"),
      });

      const result = toBookingListResponseDto([
        { booking: mockBooking, property: mockProperty },
        { booking: booking2 },
      ]);

      expect(result.bookings[0]).toHaveProperty("property");
      expect(result.bookings[0]).not.toHaveProperty("user");
      expect(result.bookings[1]).not.toHaveProperty("property");
      expect(result.total).toBe(2);
    });
  });

  describe("Edge cases", () => {
    it("should handle booking with null relations", () => {
      const result = toBookingResponseDto(mockBooking, null, null);

      expect(result).not.toHaveProperty("property");
      expect(result).not.toHaveProperty("user");
    });

    it("should handle booking with undefined relations", () => {
      const result = toBookingResponseDto(mockBooking, undefined, undefined);

      expect(result).not.toHaveProperty("property");
      expect(result).not.toHaveProperty("user");
    });
  });
});
