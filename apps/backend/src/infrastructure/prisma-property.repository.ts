import { IPropertyRepository, Property, PropertyNotFoundError } from "@repo/shared";
import { prisma } from "@repo/database";
import { toDomain } from "../mappers/prisma-property.mapper";

export class PrismaPropertyRepository implements IPropertyRepository {
  async findAll(): Promise<Property[]> {
    try {
      const properties = await prisma.property.findMany();
      return properties.map(toDomain);
    } catch (error) {
      console.error("Error finding all properties:", error);
      throw new Error("Failed to fetch properties");
    }
  }

  async findById(id: string): Promise<Property | null> {
    try {
      const property = await prisma.property.findUnique({
        where: { id },
      });

      if (!property) {
        return null;
      }

      return toDomain(property);
    } catch (error) {
      console.error(`Error finding property by id ${id}:`, error);
      throw new Error("Failed to fetch property");
    }
  }

  async save(property: Property): Promise<Property> {
    try {
      const existing = await prisma.property.findUnique({
        where: { id: property.id },
      });

      if (existing) {
        const updated = await prisma.property.update({
          where: { id: property.id },
          data: {
            title: property.getTitle(),
            description: property.getDescription(),
            address: property.getAddress().toString(),
            pricePerNight: property.getPricePerNight().toNumber(),
            imageUrl: property.getImageUrl(),
          },
        });
        return toDomain(updated);
      } else {
        const created = await prisma.property.create({
          data: {
            id: property.id,
            title: property.getTitle(),
            description: property.getDescription(),
            address: property.getAddress().toString(),
            pricePerNight: property.getPricePerNight().toNumber(),
            imageUrl: property.getImageUrl(),
            ownerId: property.ownerId,
          },
        });
        return toDomain(created);
      }
    } catch (error) {
      console.error(`Error saving property ${property.id}:`, error);
      throw new Error("Failed to save property");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await prisma.property.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new PropertyNotFoundError(id);
      }

      await prisma.property.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PropertyNotFoundError) {
        throw error;
      }
      console.error(`Error deleting property ${id}:`, error);
      throw new Error("Failed to delete property");
    }
  }
}
