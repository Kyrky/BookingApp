import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BookingController } from "../booking.controller";
import { GetBookingsUseCase } from "../../application/get-bookings.use-case";
import { GetBookingByIdUseCase } from "../../application/get-booking-by-id.use-case";
import { GetBookingsByUserUseCase } from "../../application/get-bookings-by-user.use-case";
import { CreateBookingUseCase } from "../../application/create-booking.use-case";
import { UpdateBookingUseCase } from "../../application/update-booking.use-case";
import { DeleteBookingUseCase } from "../../application/delete-booking.use-case";
import { CancelBookingUseCase } from "../../application/cancel-booking.use-case";
import { ConfirmBookingUseCase } from "../../application/confirm-booking.use-case";
import { CheckInBookingUseCase } from "../../application/check-in-booking.use-case";
import { CheckOutBookingUseCase } from "../../application/check-out-booking.use-case";
import { PrismaBookingRepository } from "../../infrastructure/prisma-booking.repository";
import { Booking, BookingStatus } from "@repo/shared";
import { Property, User } from "@repo/database";
import { AuthenticatedRequest } from "../../../../shared/utils/logger.util";
import { Response } from "express";

// Mock logger
vi.mock("@repo/shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/shared")>();
  const createMockLogger = () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    child: vi.fn(() => createMockLogger()),
  });
  return {
    ...actual,
    logger: createMockLogger(),
  };
});

// Mock logger utility
vi.mock("../../../../shared/utils/logger.util", () => ({
  loggerWithUser: vi.fn(() => {
    const createMockLogger = () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      child: vi.fn(() => createMockLogger()),
    });
    return createMockLogger();
  }),
}));

describe("BookingController", () => {
  let controller: BookingController;
  let mockGetBookingsUseCase: GetBookingsUseCase;
  let mockGetBookingByIdUseCase: GetBookingByIdUseCase;
  let mockGetBookingsByUserUseCase: GetBookingsByUserUseCase;
  let mockCreateBookingUseCase: CreateBookingUseCase;
  let mockUpdateBookingUseCase: UpdateBookingUseCase;
  let mockDeleteBookingUseCase: DeleteBookingUseCase;
  let mockCancelBookingUseCase: CancelBookingUseCase;
  let mockConfirmBookingUseCase: ConfirmBookingUseCase;
  let mockCheckInBookingUseCase: CheckInBookingUseCase;
  let mockCheckOutBookingUseCase: CheckOutBookingUseCase;
  let mockBookingRepository: PrismaBookingRepository;
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;

  const mockBooking: Booking = Booking.create({
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

  const mockProperty: Property = {
    id: "property-123",
    title: "Test Property",
    address: "123 Test St",
    imageUrl: "https://example.com/image.jpg",
    pricePerNight: 100,
    ownerId: "owner-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: User = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    passwordHash: "hash",
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockGetBookingsUseCase = {
      execute: vi.fn(),
    } as unknown as GetBookingsUseCase;

    mockGetBookingByIdUseCase = {
      execute: vi.fn(),
    } as unknown as GetBookingByIdUseCase;

    mockGetBookingsByUserUseCase = {
      execute: vi.fn(),
    } as unknown as GetBookingsByUserUseCase;

    mockCreateBookingUseCase = {
      execute: vi.fn(),
    } as unknown as CreateBookingUseCase;

    mockUpdateBookingUseCase = {
      execute: vi.fn(),
    } as unknown as UpdateBookingUseCase;

    mockDeleteBookingUseCase = {
      execute: vi.fn(),
    } as unknown as DeleteBookingUseCase;

    mockCancelBookingUseCase = {
      execute: vi.fn(),
    } as unknown as CancelBookingUseCase;

    mockConfirmBookingUseCase = {
      execute: vi.fn(),
    } as unknown as ConfirmBookingUseCase;

    mockCheckInBookingUseCase = {
      execute: vi.fn(),
    } as unknown as CheckInBookingUseCase;

    mockCheckOutBookingUseCase = {
      execute: vi.fn(),
    } as unknown as CheckOutBookingUseCase;

    mockBookingRepository = {
      findAllWithRelations: vi.fn(),
      findByUserIdWithRelations: vi.fn(),
    } as unknown as PrismaBookingRepository;

    controller = new BookingController(
      mockGetBookingsUseCase,
      mockGetBookingByIdUseCase,
      mockGetBookingsByUserUseCase,
      mockCreateBookingUseCase,
      mockUpdateBookingUseCase,
      mockDeleteBookingUseCase,
      mockCancelBookingUseCase,
      mockConfirmBookingUseCase,
      mockCheckInBookingUseCase,
      mockCheckOutBookingUseCase,
      mockBookingRepository
    );

    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });

    mockReq = {
      params: {},
      body: {},
    };

    mockRes = {
      status: statusSpy,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getBookings", () => {
    it("should return all bookings successfully", async () => {
      vi.mocked(mockBookingRepository.findAllWithRelations).mockResolvedValue([
        { booking: mockBooking, property: mockProperty, user: mockUser },
      ]);

      await controller.getBookings(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          bookings: expect.arrayContaining([
            expect.objectContaining({
              id: "booking-123",
              propertyId: "property-123",
              userId: "user-123",
            }),
          ]),
          total: 1,
        },
      });
    });

    it("should handle errors when getting bookings", async () => {
      vi.mocked(mockBookingRepository.findAllWithRelations).mockRejectedValue(
        new Error("Database error")
      );

      await controller.getBookings(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to get bookings",
      });
    });

    it("should return empty list when no bookings exist", async () => {
      vi.mocked(mockBookingRepository.findAllWithRelations).mockResolvedValue([]);

      await controller.getBookings(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          bookings: [],
          total: 0,
        },
      });
    });
  });

  describe("getBookingById", () => {
    it("should return booking by id successfully", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockGetBookingByIdUseCase.execute).mockResolvedValue(mockBooking);

      await controller.getBookingById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockGetBookingByIdUseCase.execute).toHaveBeenCalledWith("booking-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "booking-123",
        }),
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};

      await controller.getBookingById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockGetBookingByIdUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking ID is required",
      });
    });

    it("should return 404 when booking not found", async () => {
      mockReq.params = { id: "non-existent" };
      vi.mocked(mockGetBookingByIdUseCase.execute).mockRejectedValue(
        new Error("Booking not found")
      );

      await controller.getBookingById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking not found",
      });
    });

    it("should return 500 on unexpected error", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockGetBookingByIdUseCase.execute).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.getBookingById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to get booking",
      });
    });
  });

  describe("getBookingsByUser", () => {
    it("should return user bookings successfully", async () => {
      mockReq = { ...mockReq, userId: "user-123" };
      vi.mocked(mockBookingRepository.findByUserIdWithRelations).mockResolvedValue([
        { booking: mockBooking, property: mockProperty, user: mockUser },
      ]);

      await controller.getBookingsByUser(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockBookingRepository.findByUserIdWithRelations).toHaveBeenCalledWith("user-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          bookings: expect.arrayContaining([
            expect.objectContaining({
              userId: "user-123",
            }),
          ]),
          total: 1,
        },
      });
    });

    it("should return 401 when userId is missing", async () => {
      mockReq = { ...mockReq, userId: undefined };

      await controller.getBookingsByUser(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockBookingRepository.findByUserIdWithRelations).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Unauthorized",
      });
    });

    it("should handle errors when getting user bookings", async () => {
      mockReq = { ...mockReq, userId: "user-123" };
      vi.mocked(mockBookingRepository.findByUserIdWithRelations).mockRejectedValue(
        new Error("Database error")
      );

      await controller.getBookingsByUser(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to get user bookings",
      });
    });

    it("should return empty list when user has no bookings", async () => {
      mockReq = { ...mockReq, userId: "user-123" };
      vi.mocked(mockBookingRepository.findByUserIdWithRelations).mockResolvedValue([]);

      await controller.getBookingsByUser(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          bookings: [],
          total: 0,
        },
      });
    });
  });

  describe("createBooking", () => {
    it("should create booking successfully", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: 2,
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCreateBookingUseCase.execute).toHaveBeenCalledWith({
        propertyId: "property-123",
        userId: "user-123",
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        totalGuests: 2,
      });
      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "booking-123",
        }),
      });
    });

    it("should return 401 when userId is missing", async () => {
      mockReq = {
        ...mockReq,
        userId: undefined,
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: 2,
        },
      };

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCreateBookingUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Unauthorized",
      });
    });

    it("should return 404 when property not found", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "non-existent",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: 2,
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockRejectedValue(
        new Error("Property not found")
      );

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Property not found",
      });
    });

    it("should return 400 when property not available", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: 2,
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockRejectedValue(
        new Error("Property is not available for the selected dates")
      );

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Property is not available for the selected dates",
      });
    });

    it("should handle errors when creating booking", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: 2,
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to create booking",
      });
    });

    it("should convert totalGuests to number", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: "3",
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCreateBookingUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          totalGuests: 3,
        })
      );
    });
  });

  describe("updateBooking", () => {
    it("should update booking successfully", async () => {
      mockReq.params = { id: "booking-123" };
      mockReq.body = { totalGuests: 4 };
      vi.mocked(mockUpdateBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.updateBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdateBookingUseCase.execute).toHaveBeenCalledWith("booking-123", {
        totalGuests: 4,
      });
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "booking-123",
        }),
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};
      mockReq.body = { totalGuests: 4 };

      await controller.updateBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdateBookingUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking ID is required",
      });
    });

    it("should return 404 when booking not found", async () => {
      mockReq.params = { id: "non-existent" };
      mockReq.body = { totalGuests: 4 };
      vi.mocked(mockUpdateBookingUseCase.execute).mockRejectedValue(
        new Error("Booking not found")
      );

      await controller.updateBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking not found",
      });
    });

    it("should handle errors when updating booking", async () => {
      mockReq.params = { id: "booking-123" };
      mockReq.body = { totalGuests: 4 };
      vi.mocked(mockUpdateBookingUseCase.execute).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.updateBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to update booking",
      });
    });

    it("should convert totalGuests to number", async () => {
      mockReq.params = { id: "booking-123" };
      mockReq.body = { totalGuests: "5" };
      vi.mocked(mockUpdateBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.updateBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdateBookingUseCase.execute).toHaveBeenCalledWith("booking-123", {
        totalGuests: 5,
      });
    });

    it("should handle empty body", async () => {
      mockReq.params = { id: "booking-123" };
      mockReq.body = {};
      vi.mocked(mockUpdateBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.updateBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdateBookingUseCase.execute).toHaveBeenCalledWith("booking-123", {});
    });
  });

  describe("deleteBooking", () => {
    it("should delete booking successfully", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockDeleteBookingUseCase.execute).mockResolvedValue(undefined);

      await controller.deleteBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockDeleteBookingUseCase.execute).toHaveBeenCalledWith("booking-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: { message: "Booking deleted successfully" },
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};

      await controller.deleteBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockDeleteBookingUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking ID is required",
      });
    });

    it("should return 404 when booking not found", async () => {
      mockReq.params = { id: "non-existent" };
      vi.mocked(mockDeleteBookingUseCase.execute).mockRejectedValue(
        new Error("Booking not found")
      );

      await controller.deleteBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking not found",
      });
    });

    it("should handle errors when deleting booking", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockDeleteBookingUseCase.execute).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.deleteBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to delete booking",
      });
    });
  });

  describe("cancelBooking", () => {
    it("should cancel booking successfully", async () => {
      mockReq.params = { id: "booking-123" };
      const cancelledBooking = Booking.create({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });
      vi.mocked(mockCancelBookingUseCase.execute).mockResolvedValue(cancelledBooking);

      await controller.cancelBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCancelBookingUseCase.execute).toHaveBeenCalledWith("booking-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "booking-123",
          status: BookingStatus.CANCELLED,
        }),
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};

      await controller.cancelBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCancelBookingUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking ID is required",
      });
    });

    it("should return 404 when booking not found", async () => {
      mockReq.params = { id: "non-existent" };
      vi.mocked(mockCancelBookingUseCase.execute).mockRejectedValue(
        new Error("Booking not found")
      );

      await controller.cancelBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking not found",
      });
    });

    it("should return 400 when booking cannot be cancelled", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockCancelBookingUseCase.execute).mockRejectedValue(
        new Error("Booking cannot be cancelled in current status")
      );

      await controller.cancelBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking cannot be cancelled in current status",
      });
    });

    it("should handle errors when cancelling booking", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockCancelBookingUseCase.execute).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.cancelBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to cancel booking",
      });
    });
  });

  describe("confirmBooking", () => {
    it("should confirm booking successfully", async () => {
      mockReq.params = { id: "booking-123" };
      const confirmedBooking = Booking.create({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });
      vi.mocked(mockConfirmBookingUseCase.execute).mockResolvedValue(confirmedBooking);

      await controller.confirmBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockConfirmBookingUseCase.execute).toHaveBeenCalledWith("booking-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "booking-123",
          status: BookingStatus.CONFIRMED,
        }),
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};

      await controller.confirmBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockConfirmBookingUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking ID is required",
      });
    });

    it("should return 404 when booking not found", async () => {
      mockReq.params = { id: "non-existent" };
      vi.mocked(mockConfirmBookingUseCase.execute).mockRejectedValue(
        new Error("Booking not found")
      );

      await controller.confirmBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking not found",
      });
    });

    it("should return 400 when booking is not pending", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockConfirmBookingUseCase.execute).mockRejectedValue(
        new Error("Only pending bookings can be confirmed")
      );

      await controller.confirmBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Only pending bookings can be confirmed",
      });
    });

    it("should handle errors when confirming booking", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockConfirmBookingUseCase.execute).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.confirmBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to confirm booking",
      });
    });
  });

  describe("checkInBooking", () => {
    it("should check in booking successfully", async () => {
      mockReq.params = { id: "booking-123" };
      const completedBooking = Booking.create({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      });
      vi.mocked(mockCheckInBookingUseCase.execute).mockResolvedValue(completedBooking);

      await controller.checkInBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCheckInBookingUseCase.execute).toHaveBeenCalledWith("booking-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "booking-123",
          status: BookingStatus.COMPLETED,
        }),
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};

      await controller.checkInBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCheckInBookingUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking ID is required",
      });
    });

    it("should return 404 when booking not found", async () => {
      mockReq.params = { id: "non-existent" };
      vi.mocked(mockCheckInBookingUseCase.execute).mockRejectedValue(
        new Error("Booking not found")
      );

      await controller.checkInBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking not found",
      });
    });

    it("should return 400 when booking is not confirmed", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockCheckInBookingUseCase.execute).mockRejectedValue(
        new Error("Only confirmed bookings can be checked in")
      );

      await controller.checkInBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Only confirmed bookings can be checked in",
      });
    });

    it("should handle errors when checking in booking", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockCheckInBookingUseCase.execute).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.checkInBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to check in booking",
      });
    });
  });

  describe("checkOutBooking", () => {
    it("should check out booking successfully", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockCheckOutBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.checkOutBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCheckOutBookingUseCase.execute).toHaveBeenCalledWith("booking-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "booking-123",
        }),
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};

      await controller.checkOutBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCheckOutBookingUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking ID is required",
      });
    });

    it("should return 404 when booking not found", async () => {
      mockReq.params = { id: "non-existent" };
      vi.mocked(mockCheckOutBookingUseCase.execute).mockRejectedValue(
        new Error("Booking not found")
      );

      await controller.checkOutBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Booking not found",
      });
    });

    it("should return 400 when booking cannot be checked out", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockCheckOutBookingUseCase.execute).mockRejectedValue(
        new Error("Cannot check out from non-completed booking")
      );

      await controller.checkOutBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Cannot check out from non-completed booking",
      });
    });

    it("should handle errors when checking out booking", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockCheckOutBookingUseCase.execute).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.checkOutBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to check out booking",
      });
    });
  });

  describe("Response format consistency", () => {
    it("should always include success: true in successful getBookings", async () => {
      vi.mocked(mockBookingRepository.findAllWithRelations).mockResolvedValue([]);

      await controller.getBookings(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
      expect(call[0]).toHaveProperty("data");
    });

    it("should always include success: true in successful createBooking", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: 2,
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
      expect(call[0]).toHaveProperty("data");
    });

    it("should always include success: false in failed createBooking", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: 2,
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockRejectedValue(new Error("Error"));

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", false);
      expect(call[0]).toHaveProperty("error");
    });
  });

  describe("Edge cases", () => {
    it("should handle non-Error errors in getBookingById", async () => {
      mockReq.params = { id: "booking-123" };
      vi.mocked(mockGetBookingByIdUseCase.execute).mockRejectedValue("String error");

      await controller.getBookingById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to get booking",
      });
    });

    it("should handle non-Error errors in createBooking", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: 2,
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockRejectedValue("String error");

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to create booking",
      });
    });

    it("should handle zero totalGuests conversion", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          propertyId: "property-123",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          totalGuests: "0",
        },
      };
      vi.mocked(mockCreateBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.createBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCreateBookingUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          totalGuests: 0,
        })
      );
    });

    it("should handle undefined totalGuests in updateBooking", async () => {
      mockReq.params = { id: "booking-123" };
      mockReq.body = { totalGuests: undefined };
      vi.mocked(mockUpdateBookingUseCase.execute).mockResolvedValue(mockBooking);

      await controller.updateBooking(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdateBookingUseCase.execute).toHaveBeenCalledWith("booking-123", {});
    });
  });
});
