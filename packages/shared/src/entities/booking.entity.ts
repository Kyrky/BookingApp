import { BookingStatus } from "./booking-status.enum";

export class Booking {
  constructor(
    public readonly id: string,
    public readonly propertyId: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalGuests: number,
    public readonly totalPrice: number,
    public readonly status: BookingStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  toJSON() {
    return {
      id: this.id,
      propertyId: this.propertyId,
      userId: this.userId,
      startDate: this.startDate,
      endDate: this.endDate,
      totalGuests: this.totalGuests,
      totalPrice: this.totalPrice,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  getDays(): number {
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isCancelled(): boolean {
    return this.status === BookingStatus.CANCELLED;
  }

  isConfirmed(): boolean {
    return this.status === BookingStatus.CONFIRMED;
  }

  canBeCancelled(): boolean {
    return this.status === BookingStatus.PENDING || this.status === BookingStatus.CONFIRMED;
  }
}
