-- Alter User Table: Add role and updatedAt
ALTER TABLE `User` ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';
ALTER TABLE `User` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Alter Property Table: Add updatedAt
ALTER TABLE `Property` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Alter Booking Table: Add totalGuests, status, updatedAt
ALTER TABLE `Booking` ADD COLUMN `totalGuests` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `Booking` ADD COLUMN `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE `Booking` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Create indexes
CREATE INDEX `Property_ownerId_index` ON `Property`(`ownerId`);
CREATE INDEX `Booking_propertyId_index` ON `Booking`(`propertyId`);
CREATE INDEX `Booking_userId_index` ON `Booking`(`userId`);
CREATE INDEX `Booking_status_index` ON `Booking`(`status`);
