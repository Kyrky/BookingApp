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
  ) { }

  private validateId(id: string | undefined): string {
    if (!id) {
      throw new Error("Booking ID is required");
    }
    return id;
  }

  async getBookings(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const bookingsWithRelations = await this.bookingRepository.findAllWithRelations();
      res.status(200).json({
        success: true,
        data: toBookingListResponseDto(bookingsWithRelations),
      });
    } catch (error) {
      log.error("Failed to get bookings", { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ success: false, error: "Failed to get bookings" });
    }
  }

  async getBookingById(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const id = this.validateId(req.params.id);
      const withRelations = await this.bookingRepository.findByIdWithRelations(id);
      if (!withRelations) {
        res.status(404).json({ success: false, error: "Booking not found" });
        return;
      }
      res.status(200).json({
        success: true,
        data: toBookingResponseDto(withRelations.booking, withRelations.property, withRelations.user),
      });
    } catch (error) {
      log.error("Failed to get booking", { error: error instanceof Error ? error.message : String(error) });
      const status = error instanceof Error && error.message.includes("is required") ? 400 : 500;
      res.status(status).json({ success: false, error: error instanceof Error ? error.message : "Failed to get booking" });
    }
  }

  async getBookingsByUser(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    try {
      const bookingsWithRelations = await this.bookingRepository.findByUserIdWithRelations(userId);
      res.status(200).json({
        success: true,
        data: toBookingListResponseDto(bookingsWithRelations),
      });
    } catch (error) {
      log.error("Failed to get user bookings", { userId, error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ success: false, error: "Failed to get user bookings" });
    }
  }

  async createBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!userId) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const input = {
        propertyId: req.body.propertyId,
        userId: userId,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        totalGuests: Number(req.body.totalGuests),
      };

      const booking = await this.createBookingUseCase.execute(input);
      const withRelations = await this.bookingRepository.findByIdWithRelations(booking.id);

      res.status(201).json({
        success: true,
        data: toBookingResponseDto(booking, withRelations?.property, withRelations?.user),
      });
    } catch (error) {
      log.error("Failed to create booking", { error: error instanceof Error ? error.message : String(error) });
      const status = (error as any).message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, error: error instanceof Error ? error.message : "Failed to create booking" });
    }
  }

  async updateBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const id = this.validateId(req.params.id);
      const input = { totalGuests: req.body.totalGuests ? Number(req.body.totalGuests) : undefined };
      const booking = await this.updateBookingUseCase.execute(id, input);
      const withRelations = await this.bookingRepository.findByIdWithRelations(id);
      res.status(200).json({
        success: true,
        data: toBookingResponseDto(booking, withRelations?.property, withRelations?.user),
      });
    } catch (error) {
      log.error("Failed to update booking", { error: error instanceof Error ? error.message : String(error) });
      const status = error instanceof Error && error.message.includes("is required") ? 400 : 400;
      res.status(status).json({ success: false, error: error instanceof Error ? error.message : "Failed to update booking" });
    }
  }

  async deleteBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const id = this.validateId(req.params.id);
      await this.deleteBookingUseCase.execute(id);
      res.status(200).json({ success: true, data: { message: "Booking deleted successfully" } });
    } catch (error) {
      log.error("Failed to delete booking", { error: error instanceof Error ? error.message : String(error) });
      res.status(400).json({ success: false, error: "Failed to delete booking" });
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const id = this.validateId(req.params.id);
      const booking = await this.cancelBookingUseCase.execute(id);
      const withRelations = await this.bookingRepository.findByIdWithRelations(id);
      res.status(200).json({
        success: true,
        data: toBookingResponseDto(booking, withRelations?.property, withRelations?.user),
      });
    } catch (error) {
      log.error("Failed to cancel booking", { error: error instanceof Error ? error.message : String(error) });
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Failed to cancel booking" });
    }
  }

  async confirmBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const id = this.validateId(req.params.id);
      const booking = await this.confirmBookingUseCase.execute(id);
      const withRelations = await this.bookingRepository.findByIdWithRelations(id);
      res.status(200).json({
        success: true,
        data: toBookingResponseDto(booking, withRelations?.property, withRelations?.user),
      });
    } catch (error) {
      log.error("Failed to confirm booking", { error: error instanceof Error ? error.message : String(error) });
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Failed to confirm booking" });
    }
  }

  async checkInBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const id = this.validateId(req.params.id);
      const booking = await this.checkInBookingUseCase.execute(id);
      const withRelations = await this.bookingRepository.findByIdWithRelations(id);
      res.status(200).json({
        success: true,
        data: toBookingResponseDto(booking, withRelations?.property, withRelations?.user),
      });
    } catch (error) {
      log.error("Failed to check in booking", { error: error instanceof Error ? error.message : String(error) });
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Failed to check in" });
    }
  }

  async checkOutBooking(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "BOOKING" });
    try {
      const id = this.validateId(req.params.id);
      const booking = await this.checkOutBookingUseCase.execute(id);
      const withRelations = await this.bookingRepository.findByIdWithRelations(id);
      res.status(200).json({
        success: true,
        data: toBookingResponseDto(booking, withRelations?.property, withRelations?.user),
      });
    } catch (error) {
      log.error("Failed to check out booking", { error: error instanceof Error ? error.message : String(error) });
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Failed to check out" });
    }
  }
}
