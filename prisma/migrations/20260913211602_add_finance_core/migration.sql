-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CONTROL');

-- CreateEnum
CREATE TYPE "FinancialAccountSubtype" AS ENUM ('CASH', 'BANK', 'PROCESSOR_CLEARING', 'PROCESSOR_RECEIVABLE', 'ORDER_CLEARING', 'REFUND_CLEARING', 'CHARGEBACK_CLEARING', 'VENDOR_PAYABLE', 'CUSTOMER_REFUND_PAYABLE', 'PAYOUT_PENDING', 'MARKETPLACE_COMMISSION', 'SHIPPING_REVENUE', 'BOOST_REVENUE', 'OTHER_INCOME', 'PROCESSING_FEES', 'DELIVERY_EXPENSE', 'OTHER_EXPENSE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "FinancialTransactionType" AS ENUM ('SALE', 'MARKETPLACE_COMMISSION', 'PROCESSING_FEE', 'VENDOR_EARNING', 'SHIPPING_COLLECTION', 'DELIVERY_SETTLEMENT', 'SHIPPING_SUBSIDY', 'PAYOUT', 'PAYOUT_REVERSAL', 'REFUND', 'REFUND_REVERSAL', 'CANCELLATION', 'CHARGEBACK', 'CHARGEBACK_REVERSAL', 'BOOST_PURCHASE', 'BOOST_USAGE', 'OTHER_INCOME', 'OTHER_EXPENSE', 'ADJUSTMENT_CREDIT', 'ADJUSTMENT_DEBIT', 'PROCESSOR_SETTLEMENT', 'OPENING_BALANCE');

-- CreateEnum
CREATE TYPE "FinancialTransactionStatus" AS ENUM ('PENDING', 'POSTED', 'VOIDED', 'REVERSED', 'FAILED');

-- CreateEnum
CREATE TYPE "FinancialAuditAction" AS ENUM ('CREATED', 'POSTED', 'VOIDED', 'REVERSED', 'ADJUSTED', 'RECONCILED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinancialAccountType" NOT NULL,
    "subtype" "FinancialAccountSubtype",
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialTransaction" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "FinancialTransactionType" NOT NULL,
    "status" "FinancialTransactionStatus" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "description" TEXT,
    "orderId" TEXT,
    "vendorProfileId" TEXT,
    "userId" TEXT,
    "externalReference" TEXT,
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialLedgerEntry" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "description" TEXT,
    "vendorProfileId" TEXT,
    "userId" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAuditLog" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT,
    "ledgerEntryId" TEXT,
    "actorUserId" TEXT,
    "action" "FinancialAuditAction" NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccount_code_key" ON "FinancialAccount"("code");

-- CreateIndex
CREATE INDEX "FinancialAccount_type_idx" ON "FinancialAccount"("type");

-- CreateIndex
CREATE INDEX "FinancialAccount_isActive_idx" ON "FinancialAccount"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialTransaction_reference_key" ON "FinancialTransaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialTransaction_idempotencyKey_key" ON "FinancialTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "FinancialTransaction_type_idx" ON "FinancialTransaction"("type");

-- CreateIndex
CREATE INDEX "FinancialTransaction_status_idx" ON "FinancialTransaction"("status");

-- CreateIndex
CREATE INDEX "FinancialTransaction_orderId_idx" ON "FinancialTransaction"("orderId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_vendorProfileId_idx" ON "FinancialTransaction"("vendorProfileId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_userId_idx" ON "FinancialTransaction"("userId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_occurredAt_idx" ON "FinancialTransaction"("occurredAt");

-- CreateIndex
CREATE INDEX "FinancialTransaction_externalReference_idx" ON "FinancialTransaction"("externalReference");

-- CreateIndex
CREATE INDEX "FinancialLedgerEntry_transactionId_idx" ON "FinancialLedgerEntry"("transactionId");

-- CreateIndex
CREATE INDEX "FinancialLedgerEntry_accountId_idx" ON "FinancialLedgerEntry"("accountId");

-- CreateIndex
CREATE INDEX "FinancialLedgerEntry_vendorProfileId_idx" ON "FinancialLedgerEntry"("vendorProfileId");

-- CreateIndex
CREATE INDEX "FinancialLedgerEntry_userId_idx" ON "FinancialLedgerEntry"("userId");

-- CreateIndex
CREATE INDEX "FinancialLedgerEntry_orderId_idx" ON "FinancialLedgerEntry"("orderId");

-- CreateIndex
CREATE INDEX "FinancialLedgerEntry_createdAt_idx" ON "FinancialLedgerEntry"("createdAt");

-- CreateIndex
CREATE INDEX "FinancialAuditLog_transactionId_idx" ON "FinancialAuditLog"("transactionId");

-- CreateIndex
CREATE INDEX "FinancialAuditLog_ledgerEntryId_idx" ON "FinancialAuditLog"("ledgerEntryId");

-- CreateIndex
CREATE INDEX "FinancialAuditLog_actorUserId_idx" ON "FinancialAuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "FinancialAuditLog_createdAt_idx" ON "FinancialAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "FinancialLedgerEntry" ADD CONSTRAINT "FinancialLedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "FinancialTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialLedgerEntry" ADD CONSTRAINT "FinancialLedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
