import { PrismaBookingRepository } from "../infrastructure/prisma-booking.repository";
import { PrismaPropertyRepository } from "../../property/infrastructure/prisma-property.repository";
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
import { BookingController } from "../interfaces/booking.controller";

export class BookingContainer {
  private static repository: PrismaBookingRepository | null = null;
  private static propertyRepository: PrismaPropertyRepository | null = null;
  private static getBookingsUseCase: GetBookingsUseCase | null = null;
  private static getBookingByIdUseCase: GetBookingByIdUseCase | null = null;
  private static getBookingsByUserUseCase: GetBookingsByUserUseCase | null = null;
  private static createBookingUseCase: CreateBookingUseCase | null = null;
  private static updateBookingUseCase: UpdateBookingUseCase | null = null;
  private static deleteBookingUseCase: DeleteBookingUseCase | null = null;
  private static cancelBookingUseCase: CancelBookingUseCase | null = null;
  private static confirmBookingUseCase: ConfirmBookingUseCase | null = null;
  private static checkInBookingUseCase: CheckInBookingUseCase | null = null;
  private static checkOutBookingUseCase: CheckOutBookingUseCase | null = null;
  private static controller: BookingController | null = null;

  static getRepository(): PrismaBookingRepository {
    if (!this.repository) {
      this.repository = new PrismaBookingRepository();
    }
    return this.repository;
  }

  static getPropertyRepository(): PrismaPropertyRepository {
    if (!this.propertyRepository) {
      this.propertyRepository = new PrismaPropertyRepository();
    }
    return this.propertyRepository;
  }

  static getGetBookingsUseCase(): GetBookingsUseCase {
    if (!this.getBookingsUseCase) {
      this.getBookingsUseCase = new GetBookingsUseCase(this.getRepository());
    }
    return this.getBookingsUseCase;
  }

  static getGetBookingByIdUseCase(): GetBookingByIdUseCase {
    if (!this.getBookingByIdUseCase) {
      this.getBookingByIdUseCase = new GetBookingByIdUseCase(this.getRepository());
    }
    return this.getBookingByIdUseCase;
  }

  static getGetBookingsByUserUseCase(): GetBookingsByUserUseCase {
    if (!this.getBookingsByUserUseCase) {
      this.getBookingsByUserUseCase = new GetBookingsByUserUseCase(this.getRepository());
    }
    return this.getBookingsByUserUseCase;
  }

  static getCreateBookingUseCase(): CreateBookingUseCase {
    if (!this.createBookingUseCase) {
      this.createBookingUseCase = new CreateBookingUseCase(
        this.getRepository(),
        this.getPropertyRepository()
      );
    }
    return this.createBookingUseCase;
  }

  static getUpdateBookingUseCase(): UpdateBookingUseCase {
    if (!this.updateBookingUseCase) {
      this.updateBookingUseCase = new UpdateBookingUseCase(this.getRepository());
    }
    return this.updateBookingUseCase;
  }

  static getDeleteBookingUseCase(): DeleteBookingUseCase {
    if (!this.deleteBookingUseCase) {
      this.deleteBookingUseCase = new DeleteBookingUseCase(this.getRepository());
    }
    return this.deleteBookingUseCase;
  }

  static getCancelBookingUseCase(): CancelBookingUseCase {
    if (!this.cancelBookingUseCase) {
      this.cancelBookingUseCase = new CancelBookingUseCase(this.getRepository());
    }
    return this.cancelBookingUseCase;
  }

  static getConfirmBookingUseCase(): ConfirmBookingUseCase {
    if (!this.confirmBookingUseCase) {
      this.confirmBookingUseCase = new ConfirmBookingUseCase(this.getRepository());
    }
    return this.confirmBookingUseCase;
  }

  static getCheckInBookingUseCase(): CheckInBookingUseCase {
    if (!this.checkInBookingUseCase) {
      this.checkInBookingUseCase = new CheckInBookingUseCase(this.getRepository());
    }
    return this.checkInBookingUseCase;
  }

  static getCheckOutBookingUseCase(): CheckOutBookingUseCase {
    if (!this.checkOutBookingUseCase) {
      this.checkOutBookingUseCase = new CheckOutBookingUseCase(this.getRepository());
    }
    return this.checkOutBookingUseCase;
  }

  static getController(): BookingController {
    if (!this.controller) {
      this.controller = new BookingController(
        this.getGetBookingsUseCase(),
        this.getGetBookingByIdUseCase(),
        this.getGetBookingsByUserUseCase(),
        this.getCreateBookingUseCase(),
        this.getUpdateBookingUseCase(),
        this.getDeleteBookingUseCase(),
        this.getCancelBookingUseCase(),
        this.getConfirmBookingUseCase(),
        this.getCheckInBookingUseCase(),
        this.getCheckOutBookingUseCase(),
        this.getRepository()
      );
    }
    return this.controller;
  }

  static reset(): void {
    this.repository = null;
    this.propertyRepository = null;
    this.getBookingsUseCase = null;
    this.getBookingByIdUseCase = null;
    this.getBookingsByUserUseCase = null;
    this.createBookingUseCase = null;
    this.updateBookingUseCase = null;
    this.deleteBookingUseCase = null;
    this.cancelBookingUseCase = null;
    this.confirmBookingUseCase = null;
    this.checkInBookingUseCase = null;
    this.checkOutBookingUseCase = null;
    this.controller = null;
  }
}
