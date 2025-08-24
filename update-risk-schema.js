import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function updateRiskSchema() {
  try {
    console.log('🔄 Updating risk schema for user submissions and evaluations...');

    // Add new fields to risks table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "risks"
        ADD COLUMN IF NOT EXISTS "date_reported" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "attachments" JSONB,
        ADD COLUMN IF NOT EXISTS "submitted_by" INTEGER,
        ADD COLUMN IF NOT EXISTS "assessment_notes" TEXT,
        ADD COLUMN IF NOT EXISTS "severity" TEXT,
        ADD COLUMN IF NOT EXISTS "category_update" TEXT,
        ADD COLUMN IF NOT EXISTS "status_update" TEXT,
        ADD COLUMN IF NOT EXISTS "evaluated_by" INTEGER,
        ADD COLUMN IF NOT EXISTS "date_evaluated" TIMESTAMP
      `;
      console.log('✅ Added new fields to risks table');
    } catch (error) {
      console.log('ℹ️ New fields already exist or error occurred:', error.message);
    }

    // Update default status to 'Submitted'
    try {
      await prisma.$executeRaw`
        ALTER TABLE "risks" 
        ALTER COLUMN "status" SET DEFAULT 'Submitted'
      `;
      console.log('✅ Updated default status to "Submitted"');
    } catch (error) {
      console.log('ℹ️ Status update failed or already updated:', error.message);
    }

    // Add foreign key constraints if they don't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "risks"
        ADD CONSTRAINT IF NOT EXISTS "risks_submitted_by_fkey" 
        FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL
      `;
      console.log('✅ Added submitted_by foreign key constraint');
    } catch (error) {
      console.log('ℹ️ Foreign key constraint already exists or error occurred:', error.message);
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "risks"
        ADD CONSTRAINT IF NOT EXISTS "risks_evaluated_by_fkey" 
        FOREIGN KEY ("evaluated_by") REFERENCES "users"("id") ON DELETE SET NULL
      `;
      console.log('✅ Added evaluated_by foreign key constraint');
    } catch (error) {
      console.log('ℹ️ Foreign key constraint already exists or error occurred:', error.message);
    }

    console.log('🎉 Risk schema update completed!');
  } catch (error) {
    console.error('❌ Risk schema update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRiskSchema(); 