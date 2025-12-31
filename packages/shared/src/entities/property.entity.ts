import { Address } from "../value-objects/address.vo";
import { Price } from "../value-objects/price.vo";
import { PropertyStatus } from "./property-status.enum";
import { ValueError } from "../errors/value.error";

export class Property {
  private readonly MIN_TITLE_LENGTH = 3;
  private readonly MAX_TITLE_LENGTH = 200;
  private readonly MIN_DESCRIPTION_LENGTH = 10;
  private readonly MAX_DESCRIPTION_LENGTH = 5000;

  private constructor(
    public readonly id: string,
    private title: string,
    private description: string,
    private address: Address,
    private pricePerNight: Price,
    private imageUrl: string | null,
    public readonly ownerId: string,
    public status: PropertyStatus,
    public readonly createdAt: Date
  ) {
    this.validateTitle(title);
    this.validateDescription(description);
  }

  static create(input: {
    id?: string;
    title: string;
    description: string;
    address: Address;
    pricePerNight: Price;
    imageUrl?: string | null;
    ownerId: string;
    status?: PropertyStatus;
    createdAt?: Date;
  }): Property {
    return new Property(
      input.id ?? crypto.randomUUID(),
      input.title,
      input.description,
      input.address,
      input.pricePerNight,
      input.imageUrl ?? null,
      input.ownerId,
      input.status ?? PropertyStatus.AVAILABLE,
      input.createdAt ?? new Date()
    );
  }

  private validateTitle(title: string): void {
    const trimmed = title.trim();
    if (trimmed.length < this.MIN_TITLE_LENGTH) {
      throw new ValueError(
        `Title must be at least ${this.MIN_TITLE_LENGTH} characters long`
      );
    }
    if (trimmed.length > this.MAX_TITLE_LENGTH) {
      throw new ValueError(
        `Title must not exceed ${this.MAX_TITLE_LENGTH} characters`
      );
    }
  }

  private validateDescription(description: string): void {
    const trimmed = description.trim();
    if (trimmed.length < this.MIN_DESCRIPTION_LENGTH) {
      throw new ValueError(
        `Description must be at least ${this.MIN_DESCRIPTION_LENGTH} characters long`
      );
    }
    if (trimmed.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new ValueError(
        `Description must not exceed ${this.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }

  updateTitle(title: string): void {
    this.validateTitle(title);
    this.title = title.trim();
  }

  updateDescription(description: string): void {
    this.validateDescription(description);
    this.description = description.trim();
  }

  updateAddress(address: Address): void {
    this.address = address;
  }

  updatePrice(pricePerNight: Price): void {
    this.pricePerNight = pricePerNight;
  }

  updateImageUrl(imageUrl: string | null): void {
    this.imageUrl = imageUrl;
  }

  markAsAvailable(): void {
    this.status = PropertyStatus.AVAILABLE;
  }

  markAsRented(): void {
    this.status = PropertyStatus.RENTED;
  }

  markAsMaintenance(): void {
    this.status = PropertyStatus.MAINTENANCE;
  }

  markAsInactive(): void {
    this.status = PropertyStatus.INACTIVE;
  }

  isAvailable(): boolean {
    return this.status === PropertyStatus.AVAILABLE;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getAddress(): Address {
    return this.address;
  }

  getPricePerNight(): Price {
    return this.pricePerNight;
  }

  getImageUrl(): string | null {
    return this.imageUrl;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      address: this.address.toString(),
      pricePerNight: this.pricePerNight.toNumber(),
      imageUrl: this.imageUrl,
      ownerId: this.ownerId,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
