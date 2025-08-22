import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash('12345678', 12);
    console.log('Password hashed successfully');
    
    // Create the admin user
    const adminUser = await prisma.users.create({
      data: {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@admin.com',
        username: 'admin',
        employee_id: 'ADMIN-001',
        status: 'approved',
        email_verified: true,
        password_hash: hashedPassword
      }
    });
    
    console.log('Admin user created successfully!');
    console.log('User ID:', adminUser.id);
    console.log('Email:', adminUser.email);
    
    // Create Admin role if it doesn't exist
    let adminRole = await prisma.roles.findFirst({
      where: { role_name: 'Admin' }
    });
    
    if (!adminRole) {
      adminRole = await prisma.roles.create({
        data: {
          role_name: 'Admin',
          description: 'System Administrator',
          permissions: JSON.stringify(['read', 'write', 'delete', 'admin'])
        }
      });
      console.log('Admin role created');
    }
    
    // Assign Admin role to user
    await prisma.user_roles.create({
      data: {
        user_id: adminUser.id,
        role_id: adminRole.id
      }
    });
    
    console.log('Admin role assigned successfully!');
    console.log('Login: admin@admin.com / 12345678');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 