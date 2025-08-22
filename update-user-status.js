import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function updateUserStatus() {
  try {
    console.log('Updating user statuses...');
    
    // Update all users without status to have 'pending' status
    const result = await prisma.users.updateMany({
      where: {
        status: null
      },
      data: {
        status: 'pending'
      }
    });
    
    console.log(`Updated ${result.count} users to pending status`);
    
    // Set admin user to approved
    await prisma.users.updateMany({
      where: {
        email: 'admin@admin.com'
      },
      data: {
        status: 'approved'
      }
    });
    
    console.log('Admin user set to approved status');
    
    // Show all users and their status
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        employee_id: true
      }
    });
    
    console.log('\nCurrent users:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.status || 'no status'} (${user.employee_id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserStatus(); 