import { PropertyRepository } from "../domain/property.repository";
import { prisma, Property } from "@repo/database";

export class PrismaPropertyRepository implements PropertyRepository {
  async findAll(): Promise<Property[]> {
    return await prisma.property.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Property | null> {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data: Omit<Property, "id" | "createdAt">): Promise<Property> {
    return await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        pricePerNight: data.pricePerNight,
        address: data.address,
        imageUrl: data.imageUrl,
        ownerId: data.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Partial<Omit<Property, "id" | "createdAt" | "ownerId">>): Promise<Property> {
    return await prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        pricePerNight: data.pricePerNight,
        address: data.address,
        imageUrl: data.imageUrl,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Property> {
    return await prisma.property.delete({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
