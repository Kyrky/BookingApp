import { BookingStatus } from "./booking-status.enum";
import { ValueError } from "../errors/value.error";

export class Booking {
  private readonly MIN_GUESTS = 1;
  private readonly MAX_GUESTS = 50;

  private constructor(
    public readonly id: string,
    private _propertyId: string,
    private _userId: string,
    private _startDate: Date,
    private _endDate: Date,
    private _totalGuests: number,
    private _totalPrice: number,
    private _status: BookingStatus,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    this.validateDates(_startDate, _endDate);
    this.validateGuests(_totalGuests);
  }

  static create(input: {
    id?: string;
    propertyId: string;
    userId: string;
    startDate: Date | string;
    endDate: Date | string;
    totalGuests: number;
    totalPrice: number;
    status?: BookingStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): Booking {
    const startDate = input.startDate instanceof Date ? input.startDate : new Date(input.startDate);
    const endDate = input.endDate instanceof Date ? input.endDate : new Date(input.endDate);

    return new Booking(
      input.id ?? crypto.randomUUID(),
      input.propertyId,
      input.userId,
      startDate,
      endDate,
      input.totalGuests,
      input.totalPrice,
      input.status ?? BookingStatus.PENDING,
      input.createdAt ?? new Date(),
      input.updatedAt ?? new Date()
    );
  }

  private validateDates(startDate: Date, endDate: Date): void {
    if (endDate <= startDate) {
      throw new ValueError("End date must be after start date");
    }
  }

  private validateGuests(totalGuests: number): void {
    if (totalGuests < this.MIN_GUESTS) {
      throw new ValueError(`At least ${this.MIN_GUESTS} guest is required`);
    }
    if (totalGuests > this.MAX_GUESTS) {
      throw new ValueError(`Maximum ${this.MAX_GUESTS} guests allowed`);
    }
  }

  // Business methods
  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new ValueError("Booking cannot be cancelled in current status");
    }
    this._status = BookingStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  confirm(): void {
    if (this._status !== BookingStatus.PENDING) {
      throw new ValueError("Only pending bookings can be confirmed");
    }
    this._status = BookingStatus.CONFIRMED;
    this._updatedAt = new Date();
  }

  checkIn(): void {
    if (this._status !== BookingStatus.CONFIRMED) {
      throw new ValueError("Only confirmed bookings can be checked in");
    }
    this._status = BookingStatus.COMPLETED;
    this._updatedAt = new Date();
  }

  checkOut(): void {
    if (this._status !== BookingStatus.COMPLETED) {
      throw new ValueError("Cannot check out from non-completed booking");
    }
    this._updatedAt = new Date();
  }

  // Getters
  get propertyId(): string {
    return this._propertyId;
  }

  get userId(): string {
    return this._userId;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get totalGuests(): number {
    return this._totalGuests;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  get status(): BookingStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Computed properties
  getDays(): number {
    const diff = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Query methods
  isPending(): boolean {
    return this._status === BookingStatus.PENDING;
  }

  isConfirmed(): boolean {
    return this._status === BookingStatus.CONFIRMED;
  }

  isCancelled(): boolean {
    return this._status === BookingStatus.CANCELLED;
  }

  isCompleted(): boolean {
    return this._status === BookingStatus.COMPLETED;
  }

  canBeCancelled(): boolean {
    return this._status === BookingStatus.PENDING || this._status === BookingStatus.CONFIRMED;
  }

  isActive(): boolean {
    return !this.isCancelled() && !this.isCompleted();
  }

  toJSON() {
    return {
      id: this.id,
      propertyId: this._propertyId,
      userId: this._userId,
      startDate: this._startDate,
      endDate: this._endDate,
      totalGuests: this._totalGuests,
      totalPrice: this._totalPrice,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
