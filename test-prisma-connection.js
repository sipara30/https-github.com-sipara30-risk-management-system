import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing Prisma PostgreSQL connection...');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Basic connection successful!');
    
    // Test if we can query the database
    const tableCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('📋 Tables found:', tableCount[0].count);
    
    // Test specific tables
    const departments = await prisma.department.findMany();
    console.log('🏢 Departments:', departments.length);
    
    const risks = await prisma.risk.findMany();
    console.log('⚠️ Risks:', risks.length);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();




