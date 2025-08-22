import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load env: prefer OS env, fallback to backend/.env
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Hash the password properly
    const hashedPassword = await bcrypt.hash('12345678', 12);
    console.log('Password hashed successfully');

    // Ensure Administration department
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
    }

    // Ensure SystemAdmin role
    let sysAdminRole = await prisma.roles.findFirst({ where: { role_name: 'SystemAdmin' } });
    if (!sysAdminRole) {
      console.log('Creating SystemAdmin role...');
      sysAdminRole = await prisma.roles.create({
        data: {
          role_name: 'SystemAdmin',
          description: 'System Administrator with full access',
          permissions: { can_manage_users: true, can_manage_risks: true, can_manage_departments: true, can_manage_roles: true, can_view_all_data: true }
        }
      });
    }

    // Upsert admin user
    const adminEmail = 'admin@admin.com';
    const existingAdmin = await prisma.users.findFirst({ where: { email: adminEmail } });

    let adminUser;
    if (existingAdmin) {
      console.log('Admin user exists, updating...');
      adminUser = await prisma.users.update({
        where: { id: existingAdmin.id },
        data: {
          password_hash: hashedPassword,
          employment_status: 'Active',
          department_id: adminDept.id,
          username: 'admin',
          status: 'approved',
          email_verified: true
        }
      });
    } else {
      console.log('Creating new admin user...');
      adminUser = await prisma.users.create({
        data: {
          employee_id: 'ADMIN001',
          first_name: 'System',
          last_name: 'Admin',
          email: adminEmail,
          department_id: adminDept.id,
          employment_status: 'Active',
          username: 'admin',
          status: 'approved',
          email_verified: true,
          password_hash: hashedPassword,
          hire_date: new Date()
        }
      });
    }

    // Assign SystemAdmin role
    const existingRole = await prisma.user_roles.findFirst({ where: { user_id: adminUser.id, role_id: sysAdminRole.id } });
    if (!existingRole) {
      await prisma.user_roles.create({ data: { user_id: adminUser.id, role_id: sysAdminRole.id } });
    }

    console.log('✅ Admin user setup complete');
    console.log('Email: admin@admin.com');
    console.log('Password: 12345678 (hashed with bcrypt)');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
