import { IBookingRepository, BookingNotFoundError } from "@repo/shared";

export class DeleteBookingUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new BookingNotFoundError(id);
    }

    await this.bookingRepository.delete(id);
  }
}
