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
