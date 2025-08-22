import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function updateDatabase() {
  try {
    console.log('🔄 Updating database schema...');

    // First, let's check if the new fields exist
    console.log('📊 Checking current database structure...');
    
    // Try to add the new fields to existing users table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "assigned_role" TEXT,
        ADD COLUMN IF NOT EXISTS "allowed_dashboard_sections" JSONB,
        ADD COLUMN IF NOT EXISTS "permissions" JSONB
      `;
      console.log('✅ Added new fields to users table');
    } catch (error) {
      console.log('ℹ️ New fields already exist or error occurred:', error.message);
    }

    // Try to create dashboard_sections table if it doesn't exist
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "dashboard_sections" (
          "id" SERIAL PRIMARY KEY,
          "section_name" TEXT UNIQUE NOT NULL,
          "display_name" TEXT NOT NULL,
          "description" TEXT,
          "is_active" BOOLEAN DEFAULT true,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ Created dashboard_sections table');
    } catch (error) {
      console.log('ℹ️ dashboard_sections table already exists or error occurred:', error.message);
    }

    // Update roles table to add new fields
    try {
      await prisma.$executeRaw`
        ALTER TABLE "roles" 
        ADD COLUMN IF NOT EXISTS "default_dashboard_sections" JSONB
      `;
      console.log('✅ Added default_dashboard_sections to roles table');
    } catch (error) {
      console.log('ℹ️ default_dashboard_sections field already exists or error occurred:', error.message);
    }

    console.log('🎉 Database schema update completed!');
    console.log('📝 Next steps:');
    console.log('   1. Run: npx prisma db push');
    console.log('   2. Run: node prisma/seed.js');
    console.log('   3. Restart your backend server');

  } catch (error) {
    console.error('❌ Database update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDatabase(); 