import { ValueError } from "../errors/value.error";

export class Price {
  private static readonly MIN_PRICE = 0;
  private static readonly MAX_PRICE = 1000000;

  private constructor(public readonly value: number) {
    this.validate();
  }

  static create(value: number): Price {
    return new Price(value);
  }

  private validate(): void {
    if (!Number.isFinite(this.value)) {
      throw new ValueError("Price must be a finite number");
    }
    if (this.value < Price.MIN_PRICE) {
      throw new ValueError(`Price must be at least ${Price.MIN_PRICE}`);
    }
    if (this.value > Price.MAX_PRICE) {
      throw new ValueError(
        `Price must not exceed ${Price.MAX_PRICE}`
      );
    }
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }

  toNumber(): number {
    return this.value;
  }

  multiply(nights: number): Price {
    return new Price(this.value * nights);
  }
}
