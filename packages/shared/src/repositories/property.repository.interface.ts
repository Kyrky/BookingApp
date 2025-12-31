import { Property } from "../entities/property.entity";

export interface IPropertyRepository {
  findAll(): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  save(property: Property): Promise<Property>;
  delete(id: string): Promise<void>;
}
