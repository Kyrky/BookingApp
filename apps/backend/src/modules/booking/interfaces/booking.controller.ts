import { Request, Response } from "express";
import { GetBookingsUseCase } from "../application/get-bookings.use-case";
import { GetBookingByIdUseCase } from "../application/get-booking-by-id.use-case";
import { GetBookingsByUserUseCase } from "../application/get-bookings-by-user.use-case";
import { CreateBookingUseCase } from "../application/create-booking.use-case";
import { UpdateBookingUseCase } from "../application/update-booking.use-case";
import { DeleteBookingUseCase } from "../application/delete-booking.use-case";
import { CancelBookingUseCase } from "../application/cancel-booking.use-case";
import { ConfirmBookingUseCase } from "../application/confirm-booking.use-case";
import { CheckInBookingUseCase } from "../application/check-in-booking.use-case";
import { CheckOutBookingUseCase } from "../application/check-out-booking.use-case";
import { PrismaBookingRepository } from "../infrastructure/prisma-booking.repository";
import { toBookingResponseDto, toBookingListResponseDto } from "../mappers/booking-response.mapper";
import { logger } from "@repo/shared";
import { loggerWithUser, AuthenticatedRequest } from "../../../shared/utils/logger.util";

const bookingLogger = logger.child({ context: "BOOKING" });

export class BookingController {
  constructor(
    private getBookingsUseCase: GetBookingsUseCase,
    private getBookingByIdUseCase: GetBookingByIdUseCase,
    private getBookingsByUserUseCase: GetBookingsByUserUseCase,
    private createBookingUseCase: CreateBookingUseCase,
    private updateBookingUseCase: UpdateBookingUseCase,
    private deleteBookingUseCase: DeleteBookingUseCase,
    private cancelBookingUseCase: CancelBookingUseCase,
    private confirmBookingUseCase: ConfirmBookingUseCase,
    private checkInBookingUseCase: CheckInBookingUseCase,
    private checkOutBookingUseCase: CheckOutBookingUseCase,
    private bookingRepository: PrismaBookingRepository
  ) {}

  async getBookings(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });

    try {
      const bookingsWithRelations = await this.bookingRepository.findAllWithRelations();
      const response = toBookingListResponseDto(bookingsWithRelations);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to get bookings", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        success: false,
        error: "Failed to get bookings",
      });
    }
  }

  async getBookingById(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: "Booking ID is required" });
      return;
    }

    try {
      const booking = await this.getBookingByIdUseCase.execute(id);
      const response = toBookingResponseDto(booking);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to get booking", {
        bookingId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      if ((error as any).message?.includes("not found")) {
        res.status(404).json({
          success: false,
          error: "Booking not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to get booking",
      });
    }
  }

  async getBookingsByUser(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    try {
      const bookingsWithRelations = await this.bookingRepository.findByUserIdWithRelations(userId);
      const response = toBookingListResponseDto(bookingsWithRelations);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to get user bookings", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        success: false,
        error: "Failed to get user bookings",
      });
    }
  }

  async createBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });

    try {
      const userId = (req as AuthenticatedRequest).userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const input = {
        propertyId: req.body.propertyId,
        userId: userId,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        totalGuests: Number(req.body.totalGuests),
      };

      log.info("Creating booking", {
        propertyId: input.propertyId,
        userId: input.userId,
        startDate: input.startDate,
        endDate: input.endDate,
      });

      const booking = await this.createBookingUseCase.execute(input);

      log.info("Booking created successfully", { bookingId: booking.id });

      const response = toBookingResponseDto(booking);
      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to create booking", {
        error: error instanceof Error ? error.message : String(error),
      });

      if ((error as any).message?.includes("not found")) {
        res.status(404).json({
          success: false,
          error: "Property not found",
        });
        return;
      }

      if ((error as any).message?.includes("not available")) {
        res.status(400).json({
          success: false,
          error: "Property is not available for the selected dates",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to create booking",
      });
    }
  }

  async updateBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: "Booking ID is required" });
      return;
    }

    try {
      const input: Record<string, unknown> = {
        totalGuests: req.body.totalGuests ? Number(req.body.totalGuests) : undefined,
      };

      Object.keys(input).forEach((key) => {
        if (input[key] === undefined) {
          delete input[key];
        }
      });

      log.info("Updating booking", { bookingId: id, fields: Object.keys(input) });

      const booking = await this.updateBookingUseCase.execute(id, input);

      log.info("Booking updated successfully", { bookingId: id });

      const response = toBookingResponseDto(booking);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to update booking", {
        bookingId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      if ((error as any).message?.includes("not found")) {
        res.status(404).json({
          success: false,
          error: "Booking not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to update booking",
      });
    }
  }

  async deleteBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: "Booking ID is required" });
      return;
    }

    try {
      log.info("Deleting booking", { bookingId: id });

      await this.deleteBookingUseCase.execute(id);

      log.info("Booking deleted successfully", { bookingId: id });

      res.status(200).json({
        success: true,
        data: { message: "Booking deleted successfully" },
      });
    } catch (error) {
      log.error("Failed to delete booking", {
        bookingId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      if ((error as any).message?.includes("not found")) {
        res.status(404).json({
          success: false,
          error: "Booking not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to delete booking",
      });
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: "Booking ID is required" });
      return;
    }

    try {
      log.info("Cancelling booking", { bookingId: id });

      const booking = await this.cancelBookingUseCase.execute(id);

      log.info("Booking cancelled successfully", { bookingId: id });

      const response = toBookingResponseDto(booking);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to cancel booking", {
        bookingId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      if ((error as any).message?.includes("not found")) {
        res.status(404).json({
          success: false,
          error: "Booking not found",
        });
        return;
      }

      if ((error as any).message?.includes("cannot be cancelled")) {
        res.status(400).json({
          success: false,
          error: "Booking cannot be cancelled in current status",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to cancel booking",
      });
    }
  }

  async confirmBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: "Booking ID is required" });
      return;
    }

    try {
      log.info("Confirming booking", { bookingId: id });

      const booking = await this.confirmBookingUseCase.execute(id);

      log.info("Booking confirmed successfully", { bookingId: id });

      const response = toBookingResponseDto(booking);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to confirm booking", {
        bookingId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      if ((error as any).message?.includes("not found")) {
        res.status(404).json({
          success: false,
          error: "Booking not found",
        });
        return;
      }

      if ((error as any).message?.includes("Only pending")) {
        res.status(400).json({
          success: false,
          error: "Only pending bookings can be confirmed",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to confirm booking",
      });
    }
  }

  async checkInBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: "Booking ID is required" });
      return;
    }

    try {
      log.info("Checking in booking", { bookingId: id });

      const booking = await this.checkInBookingUseCase.execute(id);

      log.info("Booking checked in successfully", { bookingId: id });

      const response = toBookingResponseDto(booking);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to check in booking", {
        bookingId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      if ((error as any).message?.includes("not found")) {
        res.status(404).json({
          success: false,
          error: "Booking not found",
        });
        return;
      }

      if ((error as any).message?.includes("Only confirmed")) {
        res.status(400).json({
          success: false,
          error: "Only confirmed bookings can be checked in",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to check in booking",
      });
    }
  }

  async checkOutBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: "Booking ID is required" });
      return;
    }

    try {
      log.info("Checking out booking", { bookingId: id });

      const booking = await this.checkOutBookingUseCase.execute(id);

      log.info("Booking checked out successfully", { bookingId: id });

      const response = toBookingResponseDto(booking);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to check out booking", {
        bookingId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      if ((error as any).message?.includes("not found")) {
        res.status(404).json({
          success: false,
          error: "Booking not found",
        });
        return;
      }

      if ((error as any).message?.includes("Cannot check out")) {
        res.status(400).json({
          success: false,
          error: "Cannot check out from non-completed booking",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to check out booking",
      });
    }
  }
}
