import { IBookingRepository, Booking, BookingNotFoundError } from "@repo/shared";

export class GetBookingByIdUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new BookingNotFoundError(id);
    }

    return booking;
  }
}
