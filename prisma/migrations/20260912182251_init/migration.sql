-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FARMER', 'PROVIDER', 'COORDINATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Section" AS ENUM ('AGRI', 'HEALTH');

-- CreateEnum
CREATE TYPE "AgriCategory" AS ENUM ('DRONE_SERVICES', 'EQUIPMENT_RENTAL', 'AGRONOMIST', 'SOIL_TESTING', 'SOLAR_SERVICES');

-- CreateEnum
CREATE TYPE "HealthCategory" AS ENUM ('DOCTOR', 'NURSE', 'PHARMACY', 'PATHOLOGY_LAB', 'PHYSIOTHERAPIST', 'AMBULANCE');

-- CreateEnum
CREATE TYPE "AyushmanStatus" AS ENUM ('EMPANELLED', 'NOT_EMPANELLED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "HospitalType" AS ENUM ('GOVERNMENT', 'PRIVATE', 'CHC', 'PHC', 'CLINIC');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'AWAITING_PAYMENT', 'READY_TO_START', 'IN_PROGRESS', 'PROVIDER_COMPLETED', 'CONFIRMED', 'SETTLED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('UNPAID', 'HELD', 'RELEASING', 'RELEASED', 'REFUNDED', 'FROZEN', 'PARTIAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CREATED', 'BOOKING_ASSIGNED', 'STATUS_CHANGED', 'PAYMENT_HELD', 'PAYMENT_RELEASED', 'RATING_RECEIVED', 'VERIFICATION_UPDATE', 'GENERAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "section" "Section" NOT NULL,
    "agriCategory" "AgriCategory",
    "healthCategory" "HealthCategory",
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT NOT NULL,
    "district" TEXT,
    "phone" TEXT NOT NULL,
    "availability" TEXT,
    "ayushmanStatus" "AyushmanStatus",
    "photoUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "bankAccountNumber" TEXT,
    "bankIfsc" TEXT,
    "upiId" TEXT,
    "panNumber" TEXT,
    "payoutKycComplete" BOOLEAN NOT NULL DEFAULT false,
    "razorpayAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HospitalType" NOT NULL,
    "district" TEXT NOT NULL,
    "ayushmanStatus" "AyushmanStatus" NOT NULL,
    "departments" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emergencyReady" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "providerId" TEXT,
    "section" "Section" NOT NULL,
    "agriCategory" "AgriCategory",
    "healthCategory" "HealthCategory",
    "description" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3),
    "ayushmanCard" "AyushmanStatus",
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'UNPAID',
    "serviceAmount" INTEGER,
    "commissionRate" DOUBLE PRECISION,
    "platformFee" INTEGER,
    "providerNet" INTEGER,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpayTransferId" TEXT,
    "paidAt" TIMESTAMP(3),
    "providerCompletedAt" TIMESTAMP(3),
    "autoReleaseDueAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "disputeReason" TEXT,
    "coordinatorNotes" TEXT,
    "aiExtracted" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidence" TEXT,
    "sourceMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "bookingId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_userId_key" ON "ProviderProfile"("userId");

-- CreateIndex
CREATE INDEX "ProviderProfile_section_agriCategory_idx" ON "ProviderProfile"("section", "agriCategory");

-- CreateIndex
CREATE INDEX "ProviderProfile_section_healthCategory_idx" ON "ProviderProfile"("section", "healthCategory");

-- CreateIndex
CREATE INDEX "Hospital_district_type_idx" ON "Hospital"("district", "type");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_farmerId_idx" ON "Booking"("farmerId");

-- CreateIndex
CREATE INDEX "Booking_providerId_idx" ON "Booking"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_bookingId_key" ON "Rating"("bookingId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
