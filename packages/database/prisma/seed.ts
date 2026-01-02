import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL!;
const url = new URL(DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({
  log: ["query"],
  adapter,
});

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashed_password_1',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: 'hashed_password_2',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.property.createMany({
    data: [
      {
        id: '650e8400-e29b-41d4-a716-446655440001',
        title: 'Modern Downtown Apartment',
        description: 'A beautiful modern apartment in the heart of downtown. Features stunning city views, fully equipped kitchen, and high-speed internet. Perfect for business travelers or couples looking for a city getaway.',
        pricePerNight: 150,
        address: '123 Main Street, Downtown, NY 10001',
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440002',
        title: 'Cozy Beach House',
        description: 'Relax in this charming beach house just steps from the sand. Wake up to ocean views, enjoy morning coffee on the deck, and fall asleep to the sound of waves. Includes beach accessories and outdoor shower.',
        pricePerNight: 220,
        address: '456 Ocean Drive, Malibu, CA 90265',
        imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440003',
        title: 'Mountain Retreat Cabin',
        description: 'Escape to this rustic cabin nestled in the mountains. Features a fireplace, hot tub, hiking trails nearby, and breathtaking views. Perfect for winter skiing or summer hiking adventures.',
        pricePerNight: 180,
        address: '789 Mountain Road, Aspen, CO 81611',
        imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
        ownerId: '550e8400-e29b-41d4-a716-446655440002',
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440004',
        title: 'Urban Loft Studio',
        description: 'Stylish loft studio in a trendy neighborhood. High ceilings, exposed brick, industrial design, and filled with natural light. Walking distance to cafes, restaurants, and public transport.',
        pricePerNight: 95,
        address: '321 Arts District, Brooklyn, NY 11201',
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
        ownerId: '550e8400-e29b-41d4-a716-446655440002',
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440005',
        title: 'Luxury Villa with Pool',
        description: 'Experience luxury in this stunning villa with private pool. Spacious bedrooms, gourmet kitchen, lush garden, and outdoor entertainment area. Ideal for families or groups seeking an unforgettable vacation.',
        pricePerNight: 450,
        address: '555 Palm Avenue, Miami, FL 33139',
        imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
