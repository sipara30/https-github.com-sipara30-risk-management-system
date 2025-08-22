import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // First, let's check if we have the necessary data
    const departments = await prisma.departments.findMany();
    const roles = await prisma.roles.findMany();
    
    console.log('Available departments:', departments);
    console.log('Available roles:', roles);
    
    // Create Administration department if it doesn't exist
    let adminDept = await prisma.departments.findFirst({
      where: { department_name: 'Administration' }
    });
    
    if (!adminDept) {
      console.log('Creating Administration department...');
      adminDept = await prisma.departments.create({
        data: {
          department_name: 'Administration',
          department_code: 'ADMIN',
          description: 'Administrative Department',
          is_active: true
        }
      });
      console.log('Administration department created:', adminDept);
    } else {
      console.log('Administration department already exists:', adminDept);
    }
    
    // Create Admin role if it doesn't exist
    let adminRole = await prisma.roles.findFirst({
      where: { role_name: 'Admin' }
    });
    
    if (!adminRole) {
      console.log('Creating Admin role...');
      adminRole = await prisma.roles.create({
        data: {
          role_name: 'Admin',
          description: 'Administrator with full access',
          permissions: {
            "can_manage_users": true,
            "can_manage_risks": true,
            "can_manage_departments": true,
            "can_manage_roles": true,
            "can_view_all_data": true
          }
        }
      });
      console.log('Admin role created:', adminRole);
    } else {
      console.log('Admin role already exists:', adminRole);
    }
    
    // Check if admin user already exists
    const existingAdmin = await prisma.users.findFirst({
      where: { email: 'admin@admin.com' }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating...');
      await prisma.users.update({
        where: { id: existingAdmin.id },
        data: {
          password_hash: '12345678', // In production, this should be hashed
          employment_status: 'Active',
          department_id: adminDept.id
        }
      });
      
      // Check if admin role is assigned
      const existingRole = await prisma.user_roles.findFirst({
        where: {
          user_id: existingAdmin.id,
          role_id: adminRole.id
        }
      });
      
      if (!existingRole) {
        console.log('Assigning admin role to existing user...');
        await prisma.user_roles.create({
          data: {
            user_id: existingAdmin.id,
            role_id: adminRole.id
          }
        });
      }
      
      console.log('Admin user updated successfully');
    } else {
      console.log('Creating new admin user...');
      const adminUser = await prisma.users.create({
        data: {
          employee_id: 'ADMIN001',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@admin.com',
          department_id: adminDept.id,
          employment_status: 'Active',
          password_hash: '12345678', // In production, this should be hashed
          hire_date: new Date()
        }
      });
      
      console.log('Admin user created:', adminUser);
      
      // Assign admin role
      await prisma.user_roles.create({
        data: {
          user_id: adminUser.id,
          role_id: adminRole.id
        }
      });
      
      console.log('Admin role assigned successfully');
    }
    
    console.log('✅ Admin user setup completed successfully!');
    console.log('Email: admin@admin.com');
    console.log('Password: 12345678');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
