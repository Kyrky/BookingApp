-- Seed Users
INSERT INTO `User` (id, email, name, password, role, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', 'John Doe', 'hashed_password_1', 'USER', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'jane@example.com', 'Jane Smith', 'hashed_password_2', 'USER', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Seed Properties
INSERT INTO `Property` (id, title, description, pricePerNight, address, imageUrl, ownerId, createdAt, updatedAt) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Modern Downtown Apartment', 'A beautiful modern apartment in the heart of downtown. Features stunning city views, fully equipped kitchen, and high-speed internet. Perfect for business travelers or couples looking for a city getaway.', 150, '123 Main Street, Downtown, NY 10001', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'Cozy Beach House', 'Relax in this charming beach house just steps from the sand. Wake up to ocean views, enjoy morning coffee on the deck, and fall asleep to the sound of waves. Includes beach accessories and outdoor shower.', 220, '456 Ocean Drive, Malibu, CA 90265', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'Mountain Retreat Cabin', 'Escape to this rustic cabin nestled in the mountains. Features a fireplace, hot tub, hiking trails nearby, and breathtaking views. Perfect for winter skiing or summer hiking adventures.', 180, '789 Mountain Road, Aspen, CO 81611', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440004', 'Urban Loft Studio', 'Stylish loft studio in a trendy neighborhood. High ceilings, exposed brick, industrial design, and filled with natural light. Walking distance to cafes, restaurants, and public transport.', 95, '321 Arts District, Brooklyn, NY 11201', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440005', 'Luxury Villa with Pool', 'Experience luxury in this stunning villa with private pool. Spacious bedrooms, gourmet kitchen, lush garden, and outdoor entertainment area. Ideal for families or groups seeking an unforgettable vacation.', 450, '555 Palm Avenue, Miami, FL 33139', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);
