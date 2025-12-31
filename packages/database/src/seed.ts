import * as dotenv from "dotenv";
import { prisma } from "./index";

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting database seed...");

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create mock users
  const user1 = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "John Doe",
      password: "hashed_password_1",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "jane@example.com",
      name: "Jane Smith",
      password: "hashed_password_2",
    },
  });

  console.log(`Created users: ${user1.name}, ${user2.name}`);

  // Create mock properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: "Modern Downtown Apartment",
        description: "A beautiful modern apartment in the heart of downtown. Features stunning city views, fully equipped kitchen, and high-speed internet. Perfect for business travelers or couples looking for a city getaway.",
        pricePerNight: 150,
        address: "123 Main Street, Downtown, NY 10001",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        ownerId: user1.id,
      },
    }),
    prisma.property.create({
      data: {
        title: "Cozy Beach House",
        description: "Relax in this charming beach house just steps from the sand. Wake up to ocean views, enjoy morning coffee on the deck, and fall asleep to the sound of waves. Includes beach accessories and outdoor shower.",
        pricePerNight: 220,
        address: "456 Ocean Drive, Malibu, CA 90265",
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
        ownerId: user1.id,
      },
    }),
    prisma.property.create({
      data: {
        title: "Mountain Retreat Cabin",
        description: "Escape to this rustic cabin nestled in the mountains. Features a fireplace, hot tub, hiking trails nearby, and breathtaking views. Perfect for winter skiing or summer hiking adventures.",
        pricePerNight: 180,
        address: "789 Mountain Road, Aspen, CO 81611",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
        ownerId: user2.id,
      },
    }),
    prisma.property.create({
      data: {
        title: "Urban Loft Studio",
        description: "Stylish loft studio in a trendy neighborhood. High ceilings, exposed brick, industrial design, and filled with natural light. Walking distance to cafes, restaurants, and public transport.",
        pricePerNight: 95,
        address: "321 Arts District, Brooklyn, NY 11201",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
        ownerId: user2.id,
      },
    }),
    prisma.property.create({
      data: {
        title: "Luxury Villa with Pool",
        description: "Experience luxury in this stunning villa with private pool. Spacious bedrooms, gourmet kitchen, lush garden, and outdoor entertainment area. Ideal for families or groups seeking an unforgettable vacation.",
        pricePerNight: 450,
        address: "555 Palm Avenue, Miami, FL 33139",
        imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
        ownerId: user1.id,
      },
    }),
  ]);

  console.log(`Created ${properties.length} properties:`);
  properties.forEach((p: any) => console.log(`  - ${p.title} ($${p.pricePerNight}/night)`));

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
