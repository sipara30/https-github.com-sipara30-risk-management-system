import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'IT Department',
        code: 'IT',
        description: 'Information Technology Department'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Finance',
        code: 'FIN',
        description: 'Financial Operations Department'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Operations',
        code: 'OPS',
        description: 'Business Operations Department'
      }
    }),
    prisma.department.create({
      data: {
        name: 'HR',
        code: 'HR',
        description: 'Human Resources Department'
      }
    })
  ]);

  console.log('✅ Departments created:', departments.length);

  // Create roles
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'Admin',
        description: 'System Administrator with full access',
        permissions: ['read', 'write', 'delete', 'admin']
      }
    }),
    prisma.role.create({
      data: {
        name: 'Manager',
        description: 'Department Manager with elevated access',
        permissions: ['read', 'write', 'delete']
      }
    }),
    prisma.role.create({
      data: {
        name: 'User',
        description: 'Standard user with basic access',
        permissions: ['read', 'write']
      }
    })
  ]);

  console.log('✅ Roles created:', roles.length);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        employeeId: 'EMP001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@company.com',
        departmentId: departments[0].id, // IT Department
        employmentStatus: 'Active'
      }
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP002',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        departmentId: departments[0].id, // IT Department
        employmentStatus: 'Active'
      }
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP003',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@company.com',
        departmentId: departments[1].id, // Finance
        employmentStatus: 'Active'
      }
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP004',
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@company.com',
        departmentId: departments[2].id, // Operations
        employmentStatus: 'Active'
      }
    })
  ]);

  console.log('✅ Users created:', users.length);

  // Assign roles to users
  await Promise.all([
    prisma.userRole.create({
      data: {
        userId: users[0].id, // Admin user
        roleId: roles[0].id  // Admin role
      }
    }),
    prisma.userRole.create({
      data: {
        userId: users[1].id, // John Smith
        roleId: roles[1].id  // Manager role
      }
    }),
    prisma.userRole.create({
      data: {
        userId: users[2].id, // Sarah Johnson
        roleId: roles[2].id  // User role
      }
    }),
    prisma.userRole.create({
      data: {
        userId: users[3].id, // Mike Davis
        roleId: roles[2].id  // User role
      }
    })
  ]);

  console.log('✅ User roles assigned');

  // Create risk categories
  const categories = await Promise.all([
    prisma.riskCategory.create({
      data: {
        name: 'Financial',
        code: 'FIN',
        description: 'Financial risks including costs, revenue impacts, and budget overruns'
      }
    }),
    prisma.riskCategory.create({
      data: {
        name: 'Security',
        code: 'SEC',
        description: 'Security and data protection risks'
      }
    }),
    prisma.riskCategory.create({
      data: {
        name: 'Operational',
        code: 'OPS',
        description: 'Operational and process-related risks'
      }
    }),
    prisma.riskCategory.create({
      data: {
        name: 'Technical',
        code: 'TECH',
        description: 'Technical and infrastructure risks'
      }
    }),
    prisma.riskCategory.create({
      data: {
        name: 'Compliance',
        code: 'COMP',
        description: 'Regulatory and compliance risks'
      }
    })
  ]);

  console.log('✅ Risk categories created:', categories.length);

  // Create sample risks
  const risks = await Promise.all([
    prisma.risk.create({
      data: {
        code: 'RISK-001',
        title: 'Data Breach Risk',
        description: 'Potential security vulnerability in user authentication system',
        whatCanHappen: 'Customer data could be stolen, leading to financial loss and reputation damage',
        status: 'Assessed',
        priority: 'High',
        categoryId: categories[1].id, // Security
        departmentId: departments[0].id, // IT Department
        ownerId: users[1].id, // John Smith
        managerId: users[0].id, // Admin
        identifiedDate: new Date('2024-01-15'),
        nextReviewDate: new Date('2024-04-15'),
        documentationStatus: 'Draft'
      }
    }),
    prisma.risk.create({
      data: {
        code: 'RISK-002',
        title: 'Budget Overrun',
        description: 'Project costs exceeding allocated budget',
        whatCanHappen: 'Project delays, cost overruns, stakeholder dissatisfaction',
        status: 'Treated',
        priority: 'Medium',
        categoryId: categories[0].id, // Financial
        departmentId: departments[1].id, // Finance
        ownerId: users[2].id, // Sarah Johnson
        managerId: users[0].id, // Admin
        identifiedDate: new Date('2024-01-20'),
        nextReviewDate: new Date('2024-07-20'),
        documentationStatus: 'Complete'
      }
    })
  ]);

  console.log('✅ Sample risks created:', risks.length);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
