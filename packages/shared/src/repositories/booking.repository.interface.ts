import { Booking } from "../entities/booking.entity";

export interface IBookingRepository {
  findAll(): Promise<Booking[]>;
  findById(id: string): Promise<Booking | null>;
  findByUserId(userId: string): Promise<Booking[]>;
  findByPropertyId(propertyId: string): Promise<Booking[]>;
  findActiveByPropertyId(propertyId: string): Promise<Booking[]>;
  findOverlappingBookings(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string
  ): Promise<Booking[]>;
  save(booking: Booking): Promise<Booking>;
  delete(id: string): Promise<void>;
}
