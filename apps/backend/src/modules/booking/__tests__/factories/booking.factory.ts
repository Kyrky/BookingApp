import { Booking, BookingStatus } from "@repo/shared";

export class BookingFactory {
  static create(overrides: Partial<Booking> = {}): Booking {
    return Booking.create({
      id: overrides.id || "booking-123",
      propertyId: overrides.propertyId || "property-123",
      userId: overrides.userId || "user-123",
      startDate: overrides.startDate || new Date("2025-02-01"),
      endDate: overrides.endDate || new Date("2025-02-05"),
      totalGuests: overrides.totalGuests || 2,
      totalPrice: overrides.totalPrice || 500,
      status: overrides.status || BookingStatus.PENDING,
      createdAt: overrides.createdAt || new Date("2025-01-01"),
      updatedAt: overrides.updatedAt || new Date("2025-01-01"),
    });
  }

  static confirmed(overrides: Partial<Booking> = {}): Booking {
    const booking = this.create(overrides);
    booking.confirm();
    return booking;
  }

  static cancelled(overrides: Partial<Booking> = {}): Booking {
    const booking = this.create(overrides);
    booking.cancel();
    return booking;
  }

  static completed(overrides: Partial<Booking> = {}): Booking {
    const booking = this.create(overrides);
    booking.confirm();
    booking.checkIn();
    return booking;
  }

  static withPropertyId(propertyId: string): Booking {
    return this.create({ propertyId });
  }

  static withUserId(userId: string): Booking {
    return this.create({ userId });
  }

  static withDates(startDate: Date, endDate: Date): Booking {
    return this.create({ startDate, endDate });
  }
}
