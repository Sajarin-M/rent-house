-- CreateEnum
CREATE TYPE "RentOutStatus" AS ENUM ('Pending', 'Partially_Returned', 'Returned');

-- CreateEnum
CREATE TYPE "RentOutPaymentStatus" AS ENUM ('Pending', 'Partially_Paid', 'Paid');

-- CreateEnum
CREATE TYPE "RentPaymentType" AS ENUM ('Advance', 'Normal');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "quantity" INTEGER NOT NULL,
    "rentPerDay" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "images" TEXT[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentOut" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "RentOutStatus" NOT NULL DEFAULT 'Pending',
    "paymentStatus" "RentOutPaymentStatus" NOT NULL DEFAULT 'Pending',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RentOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentPayment" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "RentPaymentType" NOT NULL DEFAULT 'Normal',
    "rentOutId" TEXT NOT NULL,
    "rentReturnId" TEXT,
    "description" TEXT,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receivedAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentReturn" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rentOutId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnItem" (
    "id" TEXT NOT NULL,
    "rentOutItemId" TEXT NOT NULL,
    "usedDays" DOUBLE PRECISION NOT NULL,
    "rentPerDay" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rentReturnId" TEXT,

    CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentOutItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rentPerDay" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rentOutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentOutItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentPayment_rentReturnId_key" ON "RentPayment"("rentReturnId");

-- AddForeignKey
ALTER TABLE "RentOut" ADD CONSTRAINT "RentOut_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_rentOutId_fkey" FOREIGN KEY ("rentOutId") REFERENCES "RentOut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_rentReturnId_fkey" FOREIGN KEY ("rentReturnId") REFERENCES "RentReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentReturn" ADD CONSTRAINT "RentReturn_rentOutId_fkey" FOREIGN KEY ("rentOutId") REFERENCES "RentOut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_rentOutItemId_fkey" FOREIGN KEY ("rentOutItemId") REFERENCES "RentOutItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_rentReturnId_fkey" FOREIGN KEY ("rentReturnId") REFERENCES "RentReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentOutItem" ADD CONSTRAINT "RentOutItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentOutItem" ADD CONSTRAINT "RentOutItem_rentOutId_fkey" FOREIGN KEY ("rentOutId") REFERENCES "RentOut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
