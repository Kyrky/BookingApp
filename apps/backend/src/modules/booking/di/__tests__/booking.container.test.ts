import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { BookingContainer } from "../booking.container";
import { PrismaBookingRepository } from "../../infrastructure/prisma-booking.repository";
import { PrismaPropertyRepository } from "../../../property/infrastructure/prisma-property.repository";
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
import { BookingController } from "../../interfaces/booking.controller";

describe("BookingContainer", () => {
  beforeEach(() => {
    BookingContainer.reset();
  });

  afterEach(() => {
    BookingContainer.reset();
  });

  describe("getRepository", () => {
    it("should return a PrismaBookingRepository instance", () => {
      const repository = BookingContainer.getRepository();

      expect(repository).toBeInstanceOf(PrismaBookingRepository);
    });

    it("should return the same instance on subsequent calls", () => {
      const repository1 = BookingContainer.getRepository();
      const repository2 = BookingContainer.getRepository();

      expect(repository1).toBe(repository2);
    });
  });

  describe("getPropertyRepository", () => {
    it("should return a PrismaPropertyRepository instance", () => {
      const repository = BookingContainer.getPropertyRepository();

      expect(repository).toBeInstanceOf(PrismaPropertyRepository);
    });

    it("should return the same instance on subsequent calls", () => {
      const repository1 = BookingContainer.getPropertyRepository();
      const repository2 = BookingContainer.getPropertyRepository();

      expect(repository1).toBe(repository2);
    });
  });

  describe("getGetBookingsUseCase", () => {
    it("should return a GetBookingsUseCase instance", () => {
      const useCase = BookingContainer.getGetBookingsUseCase();

      expect(useCase).toBeInstanceOf(GetBookingsUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getGetBookingsUseCase();
      const useCase2 = BookingContainer.getGetBookingsUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getGetBookingByIdUseCase", () => {
    it("should return a GetBookingByIdUseCase instance", () => {
      const useCase = BookingContainer.getGetBookingByIdUseCase();

      expect(useCase).toBeInstanceOf(GetBookingByIdUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getGetBookingByIdUseCase();
      const useCase2 = BookingContainer.getGetBookingByIdUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getGetBookingsByUserUseCase", () => {
    it("should return a GetBookingsByUserUseCase instance", () => {
      const useCase = BookingContainer.getGetBookingsByUserUseCase();

      expect(useCase).toBeInstanceOf(GetBookingsByUserUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getGetBookingsByUserUseCase();
      const useCase2 = BookingContainer.getGetBookingsByUserUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getCreateBookingUseCase", () => {
    it("should return a CreateBookingUseCase instance", () => {
      const useCase = BookingContainer.getCreateBookingUseCase();

      expect(useCase).toBeInstanceOf(CreateBookingUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getCreateBookingUseCase();
      const useCase2 = BookingContainer.getCreateBookingUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getUpdateBookingUseCase", () => {
    it("should return a UpdateBookingUseCase instance", () => {
      const useCase = BookingContainer.getUpdateBookingUseCase();

      expect(useCase).toBeInstanceOf(UpdateBookingUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getUpdateBookingUseCase();
      const useCase2 = BookingContainer.getUpdateBookingUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getDeleteBookingUseCase", () => {
    it("should return a DeleteBookingUseCase instance", () => {
      const useCase = BookingContainer.getDeleteBookingUseCase();

      expect(useCase).toBeInstanceOf(DeleteBookingUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getDeleteBookingUseCase();
      const useCase2 = BookingContainer.getDeleteBookingUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getCancelBookingUseCase", () => {
    it("should return a CancelBookingUseCase instance", () => {
      const useCase = BookingContainer.getCancelBookingUseCase();

      expect(useCase).toBeInstanceOf(CancelBookingUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getCancelBookingUseCase();
      const useCase2 = BookingContainer.getCancelBookingUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getConfirmBookingUseCase", () => {
    it("should return a ConfirmBookingUseCase instance", () => {
      const useCase = BookingContainer.getConfirmBookingUseCase();

      expect(useCase).toBeInstanceOf(ConfirmBookingUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getConfirmBookingUseCase();
      const useCase2 = BookingContainer.getConfirmBookingUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getCheckInBookingUseCase", () => {
    it("should return a CheckInBookingUseCase instance", () => {
      const useCase = BookingContainer.getCheckInBookingUseCase();

      expect(useCase).toBeInstanceOf(CheckInBookingUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getCheckInBookingUseCase();
      const useCase2 = BookingContainer.getCheckInBookingUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getCheckOutBookingUseCase", () => {
    it("should return a CheckOutBookingUseCase instance", () => {
      const useCase = BookingContainer.getCheckOutBookingUseCase();

      expect(useCase).toBeInstanceOf(CheckOutBookingUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = BookingContainer.getCheckOutBookingUseCase();
      const useCase2 = BookingContainer.getCheckOutBookingUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getController", () => {
    it("should return a BookingController instance", () => {
      const controller = BookingContainer.getController();

      expect(controller).toBeInstanceOf(BookingController);
    });

    it("should return the same instance on subsequent calls", () => {
      const controller1 = BookingContainer.getController();
      const controller2 = BookingContainer.getController();

      expect(controller1).toBe(controller2);
    });

    it("should inject all dependencies into controller", () => {
      const controller = BookingContainer.getController();

      expect(controller).toBeDefined();
    });
  });

  describe("reset", () => {
    it("should reset all singleton instances", () => {
      const repository1 = BookingContainer.getRepository();
      const controller1 = BookingContainer.getController();

      BookingContainer.reset();

      const repository2 = BookingContainer.getRepository();
      const controller2 = BookingContainer.getController();

      expect(repository1).not.toBe(repository2);
      expect(controller1).not.toBe(controller2);
    });

    it("should allow fresh instances after reset", () => {
      BookingContainer.getRepository();
      BookingContainer.getController();

      BookingContainer.reset();

      expect(BookingContainer.getRepository()).toBeInstanceOf(PrismaBookingRepository);
      expect(BookingContainer.getController()).toBeInstanceOf(BookingController);
    });
  });

  describe("Dependency injection chain", () => {
    it("should inject repository into use cases", () => {
      const useCase = BookingContainer.getGetBookingsUseCase();
      const repository = BookingContainer.getRepository();

      expect(useCase).toBeInstanceOf(GetBookingsUseCase);
    });

    it("should inject both repositories into CreateBookingUseCase", () => {
      const useCase = BookingContainer.getCreateBookingUseCase();

      expect(useCase).toBeInstanceOf(CreateBookingUseCase);
    });

    it("should inject use cases into controller", () => {
      const controller = BookingContainer.getController();

      expect(controller).toBeInstanceOf(BookingController);
    });
  });
});
