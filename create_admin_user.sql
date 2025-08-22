-- Create Admin User for Government Risk Management System
-- Run this script to create the admin user: admin@admin.com / 12345678

-- First, ensure the database and tables exist
-- (This assumes you've already run the main setup_database.sql)

USE risk_management;

-- Clear any existing admin user to avoid duplicates
DELETE FROM user_roles WHERE user_id IN (SELECT user_id FROM users WHERE email = 'admin@admin.com');
DELETE FROM users WHERE email = 'admin@admin.com';

-- Insert the admin user
-- Password: 12345678 (hashed with bcrypt)
INSERT INTO users (
    username, 
    first_name, 
    last_name, 
    email, 
    employee_id, 
    department_id, 
    password_hash,
    status
) VALUES (
    'admin',
    'System',
    'Administrator', 
    'admin@admin.com',
    'ADMIN001',
    1, -- IT Department
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    'active'
);

-- Get the admin user ID
SET @admin_user_id = LAST_INSERT_ID();

-- Get the Admin role ID
SET @admin_role_id = (SELECT role_id FROM roles WHERE role_name = 'Admin' LIMIT 1);

-- Assign Admin role to the user
INSERT INTO user_roles (user_id, role_id) VALUES (@admin_user_id, @admin_role_id);

-- Verify the user was created
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    u.email,
    u.employee_id,
    u.status,
    d.department_name,
    r.role_name
FROM users u
JOIN departments d ON u.department_id = d.department_id
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'admin@admin.com';

-- Display success message
SELECT 'Admin user created successfully!' as message;
SELECT 'Login: admin@admin.com' as login_info;
SELECT 'Password: 12345678' as password_info;

