import { ValueError } from "../errors/value.error";

export class Address {
  private static readonly MIN_LENGTH = 5;
  private static readonly MAX_LENGTH = 500;

  private constructor(public readonly value: string) {
    this.validate();
  }

  static create(value: string): Address {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new ValueError("Address cannot be empty");
    }
    return new Address(trimmed);
  }

  private validate(): void {
    const length = this.value.length;
    if (length < Address.MIN_LENGTH) {
      throw new ValueError(
        `Address must be at least ${Address.MIN_LENGTH} characters long`
      );
    }
    if (length > Address.MAX_LENGTH) {
      throw new ValueError(
        `Address must not exceed ${Address.MAX_LENGTH} characters`
      );
    }
  }

  equals(other: Address): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
