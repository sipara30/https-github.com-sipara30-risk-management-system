import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create dashboard sections
  const dashboardSections = [
    { section_name: 'overview', display_name: 'Overview', description: 'Dashboard overview and summary' },
    { section_name: 'user_management', display_name: 'User Management', description: 'Manage system users' },
    { section_name: 'pending_requests', display_name: 'Pending Requests', description: 'View and approve user requests' },
    { section_name: 'system_health', display_name: 'System Health', description: 'System monitoring and health' },
    { section_name: 'risk_management', display_name: 'Risk Management', description: 'Risk assessment and management' },
    { section_name: 'reports', display_name: 'Reports', description: 'Generate and view reports' },
    { section_name: 'settings', display_name: 'Settings', description: 'System configuration' },
    { section_name: 'audit_logs', display_name: 'Audit Logs', description: 'System activity logs' }
  ];

  for (const section of dashboardSections) {
    await prisma.dashboard_sections.upsert({
      where: { section_name: section.section_name },
      update: section,
      create: section
    });
  }
  console.log('✅ Dashboard sections created');

  // Create predefined roles with permissions
  const roles = [
    {
      role_name: 'SystemAdmin',
      description: 'Full system administrator with all permissions',
      permissions: {
        can_manage_users: true,
        can_approve_users: true,
        can_assign_roles: true,
        can_manage_roles: true,
        can_access_all_sections: true,
        can_delete_users: true,
        can_view_audit_logs: true
      },
      default_dashboard_sections: ['overview', 'user_management', 'pending_requests', 'system_health', 'risk_management', 'reports', 'settings', 'audit_logs']
    },
    {
      role_name: 'Admin',
      description: 'Administrator with user management permissions',
      permissions: {
        can_manage_users: true,
        can_approve_users: true,
        can_assign_roles: true,
        can_manage_roles: false,
        can_access_all_sections: false,
        can_delete_users: false,
        can_view_audit_logs: false
      },
      default_dashboard_sections: ['overview', 'user_management', 'pending_requests', 'system_health']
    },
    {
      role_name: 'CEO',
      description: 'Chief Executive Officer with strategic oversight',
      permissions: {
        can_manage_users: false,
        can_approve_users: false,
        can_assign_roles: false,
        can_manage_roles: false,
        can_access_all_sections: false,
        can_delete_users: false,
        can_view_audit_logs: false
      },
      default_dashboard_sections: ['overview', 'risk_management', 'reports']
    },
    {
      role_name: 'RiskOwner',
      description: 'Risk owner with risk management permissions',
      permissions: {
        can_manage_users: false,
        can_approve_users: false,
        can_assign_roles: false,
        can_manage_roles: false,
        can_access_all_sections: false,
        can_delete_users: false,
        can_view_audit_logs: false
      },
      default_dashboard_sections: ['overview', 'risk_management', 'reports']
    },
    {
      role_name: 'Auditor',
      description: 'Auditor with read-only access to specific sections',
      permissions: {
        can_manage_users: false,
        can_approve_users: false,
        can_assign_roles: false,
        can_manage_roles: false,
        can_access_all_sections: false,
        can_delete_users: false,
        can_view_audit_logs: true
      },
      default_dashboard_sections: ['overview', 'risk_management', 'reports', 'audit_logs']
    },
    {
      role_name: 'User',
      description: 'Standard user with basic access',
      permissions: {
        can_manage_users: false,
        can_approve_users: false,
        can_assign_roles: false,
        can_manage_roles: false,
        can_access_all_sections: false,
        can_delete_users: false,
        can_view_audit_logs: false
      },
      default_dashboard_sections: ['overview', 'risk_management']
    }
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { role_name: role.role_name },
      update: role,
      create: role
    });
  }
  console.log('✅ Roles created with permissions');

  // Create default department if it doesn't exist
  await prisma.departments.upsert({
    where: { department_name: 'Administration' },
    update: {},
    create: {
      department_name: 'Administration',
      department_code: 'ADMIN',
      description: 'System administration department'
    }
  });
  console.log('✅ Default department created');

  // Create sample departments
  const departments = [
    { name: 'IT', code: 'IT', description: 'Information Technology Department' },
    { name: 'Finance', code: 'FIN', description: 'Finance and Accounting Department' },
    { name: 'Operations', code: 'OPS', description: 'Operations and Production Department' },
    { name: 'Human Resources', code: 'HR', description: 'Human Resources Department' },
    { name: 'Legal', code: 'LEGAL', description: 'Legal and Compliance Department' }
  ];

  for (const dept of departments) {
    await prisma.departments.upsert({
      where: { department_name: dept.name },
      update: {},
      create: {
        department_name: dept.name,
        department_code: dept.code,
        description: dept.description
    }
  });
  }
  console.log('✅ Sample departments created');

  // Create sample risk categories
  const categories = [
    { name: 'Technical', code: 'TECH', description: 'Technology and infrastructure risks' },
    { name: 'Operational', code: 'OPS', description: 'Operational and process risks' },
    { name: 'Financial', code: 'FIN', description: 'Financial and budgetary risks' },
    { name: 'Strategic', code: 'STRAT', description: 'Strategic and business risks' },
    { name: 'Compliance', code: 'COMP', description: 'Regulatory and compliance risks' },
    { name: 'Security', code: 'SEC', description: 'Information security and privacy risks' },
    { name: 'Environmental', code: 'ENV', description: 'Environmental and sustainability risks' },
    { name: 'Reputational', code: 'REP', description: 'Reputation and brand risks' }
  ];

  for (const cat of categories) {
    await prisma.risk_categories.upsert({
      where: { category_name: cat.name },
      update: {},
      create: {
        category_name: cat.name,
        category_code: cat.code,
        description: cat.description
      }
    });
  }
  console.log('✅ Sample risk categories created');

  // Create sample users for risk reporting and evaluation
  const sampleUsers = [
    {
      employee_id: 'EMP001',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@company.com',
      password_hash: 'password123', // This will be hashed in production
      employment_status: 'Active',
      assigned_role: 'User',
      status: 'approved'
    },
    {
      employee_id: 'EMP002',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@company.com',
      password_hash: 'password123', // This will be hashed in production
      employment_status: 'Active',
      assigned_role: 'RiskOwner',
      status: 'approved'
    },
    {
      employee_id: 'EMP003',
      first_name: 'Mike',
      last_name: 'Davis',
      email: 'mike.davis@company.com',
      password_hash: 'password123', // This will be hashed in production
      employment_status: 'Active',
      assigned_role: 'User',
      status: 'approved'
    }
  ];

  for (const user of sampleUsers) {
    await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }
  console.log('✅ Sample users created');

  // Get the created users, departments, and categories for risk creation
  const john = await prisma.users.findUnique({ where: { email: 'john.smith@company.com' } });
  const sarah = await prisma.users.findUnique({ where: { email: 'sarah.johnson@company.com' } });
  const mike = await prisma.users.findUnique({ where: { email: 'mike.davis@company.com' } });
  const itDept = await prisma.departments.findUnique({ where: { department_name: 'IT' } });
  const financeDept = await prisma.departments.findUnique({ where: { department_name: 'Finance' } });
  const techCategory = await prisma.risk_categories.findUnique({ where: { category_name: 'Technical' } });
  const financialCategory = await prisma.risk_categories.findUnique({ where: { category_name: 'Financial' } });

  // Create sample risks with complete data
  const sampleRisks = [
    {
      risk_code: 'RISK-001',
      risk_title: 'Data Center Power Failure',
      risk_description: 'Risk of power failure in the main data center affecting critical business systems',
      what_can_happen: 'Complete system outage affecting 500+ users and critical business operations',
      department_id: itDept?.id,
      risk_category_id: techCategory?.id,
      submitted_by: john?.id,
      status: 'Submitted',
      priority: 'High',
      date_reported: new Date('2024-01-15'),
      workflow_step: 1,
      workflow_status: {
        step1_completed: true,
        step2_completed: false,
        step3_completed: false,
        step4_completed: false,
        step5_completed: false,
        step6_completed: false,
        last_updated: new Date().toISOString()
      }
    },
    {
      risk_code: 'RISK-002',
      risk_title: 'Budget Overrun Risk',
      risk_description: 'Risk of exceeding allocated budget for Q1 2024 due to unexpected costs',
      what_can_happen: 'Financial constraints affecting project delivery and operational efficiency',
      department_id: financeDept?.id,
      risk_category_id: financialCategory?.id,
      submitted_by: mike?.id,
      evaluated_by: sarah?.id,
      status: 'In Review',
      priority: 'Medium',
      date_reported: new Date('2024-01-10'),
      date_evaluated: new Date('2024-01-12'),
      assessment_notes: 'Risk assessment completed. Monitoring required for next 30 days.',
      severity: 'Medium',
      category_update: 'Financial',
      status_update: 'In Review',
      workflow_step: 2,
      workflow_status: {
        step1_completed: true,
        step2_completed: true,
        step3_completed: false,
        step4_completed: false,
        step5_completed: false,
        step6_completed: false,
        last_updated: new Date().toISOString()
      }
    },
    {
      risk_code: 'RISK-003',
      risk_title: 'Cybersecurity Breach',
      risk_description: 'Risk of unauthorized access to sensitive customer data',
      what_can_happen: 'Data breach leading to regulatory fines and reputational damage',
      department_id: itDept?.id,
      risk_category_id: techCategory?.id,
      submitted_by: john?.id,
      status: 'Submitted',
      priority: 'High',
      date_reported: new Date('2024-01-20'),
      workflow_step: 1,
      workflow_status: {
        step1_completed: true,
        step2_completed: false,
        step3_completed: false,
        step4_completed: false,
        step5_completed: false,
        step6_completed: false,
        last_updated: new Date().toISOString()
      }
    }
  ];

  for (const risk of sampleRisks) {
    await prisma.risks.upsert({
      where: { risk_code: risk.risk_code },
      update: {},
      create: risk
    });
  }
  console.log('✅ Sample risks created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
