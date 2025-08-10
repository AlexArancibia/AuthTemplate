-- CreateTable
CREATE TABLE "anj"."PasswordResetToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("identifier")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_identifier_key" ON "anj"."PasswordResetToken"("identifier");
