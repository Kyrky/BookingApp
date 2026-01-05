import { IBookingRepository, Booking, BookingNotFoundError } from "@repo/shared";

export interface UpdateBookingInput {
  totalGuests?: number;
}

export class UpdateBookingUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(id: string, input: UpdateBookingInput): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new BookingNotFoundError(id);
    }

    // Create new booking instance with updated values
    const updatedBooking = Booking.create({
      id: booking.id,
      propertyId: booking.propertyId,
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalGuests: input.totalGuests ?? booking.totalGuests,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: new Date(),
    });

    return await this.bookingRepository.save(updatedBooking);
  }
}
