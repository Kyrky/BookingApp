import { Property } from "@repo/database";

export interface PropertyRepository {
  findAll(): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  create(data: Omit<Property, "id" | "createdAt">): Promise<Property>;
  update(id: string, data: Partial<Omit<Property, "id" | "createdAt" | "ownerId">>): Promise<Property>;
  delete(id: string): Promise<Property>;
}
