-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'SOLD');

-- CreateEnum
CREATE TYPE "userRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "userRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "mileage" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL,
    "seats" INTEGER,
    "description" TEXT NOT NULL,
    "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE',
    "featured" BOOLEAN NOT NULL,
    "image" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerShipInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Vehical Motors',
    "address" TEXT NOT NULL DEFAULT '69 Car Street, Autoville, CA 69420',
    "phone" TEXT NOT NULL DEFAULT '92 3472601202',
    "email" TEXT NOT NULL DEFAULT 'bilalhassan56602@gmail.com',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealerShipInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHours" (
    "id" TEXT NOT NULL,
    "dealerShipId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSaveCar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carId" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSaveCar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestDriveBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carId" TEXT,
    "bookingDate" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestDriveBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Car_bodyType_idx" ON "Car"("bodyType");

-- CreateIndex
CREATE INDEX "Car_price_idx" ON "Car"("price");

-- CreateIndex
CREATE INDEX "Car_year_idx" ON "Car"("year");

-- CreateIndex
CREATE INDEX "Car_status_idx" ON "Car"("status");

-- CreateIndex
CREATE INDEX "Car_fuelType_idx" ON "Car"("fuelType");

-- CreateIndex
CREATE INDEX "Car_featured_idx" ON "Car"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "Car_make_model_key" ON "Car"("make", "model");

-- CreateIndex
CREATE INDEX "WorkingHours_dealerShipId_idx" ON "WorkingHours"("dealerShipId");

-- CreateIndex
CREATE INDEX "WorkingHours_dayOfWeek_idx" ON "WorkingHours"("dayOfWeek");

-- CreateIndex
CREATE INDEX "WorkingHours_isOpen_idx" ON "WorkingHours"("isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHours_dealerShipId_dayOfWeek_key" ON "WorkingHours"("dealerShipId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "UserSaveCar_userId_idx" ON "UserSaveCar"("userId");

-- CreateIndex
CREATE INDEX "UserSaveCar_carId_idx" ON "UserSaveCar"("carId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSaveCar_userId_carId_key" ON "UserSaveCar"("userId", "carId");

-- CreateIndex
CREATE INDEX "TestDriveBooking_carId_idx" ON "TestDriveBooking"("carId");

-- CreateIndex
CREATE INDEX "TestDriveBooking_userId_idx" ON "TestDriveBooking"("userId");

-- CreateIndex
CREATE INDEX "TestDriveBooking_bookingDate_idx" ON "TestDriveBooking"("bookingDate");

-- CreateIndex
CREATE INDEX "TestDriveBooking_status_idx" ON "TestDriveBooking"("status");

-- AddForeignKey
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_dealerShipId_fkey" FOREIGN KEY ("dealerShipId") REFERENCES "DealerShipInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSaveCar" ADD CONSTRAINT "UserSaveCar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSaveCar" ADD CONSTRAINT "UserSaveCar_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
