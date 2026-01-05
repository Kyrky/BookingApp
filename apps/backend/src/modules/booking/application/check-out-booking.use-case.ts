import { IBookingRepository, Booking, BookingNotFoundError } from "@repo/shared";

export class CheckOutBookingUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new BookingNotFoundError(id);
    }

    booking.checkOut();
    return await this.bookingRepository.save(booking);
  }
}
