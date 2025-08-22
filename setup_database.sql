-- Risk Management Database Setup
-- Run this in phpMyAdmin or MySQL command line

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS risk_management;
USE risk_management;

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create roles table with enhanced permissions
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    department_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_role_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Create risk_categories table
CREATE TABLE IF NOT EXISTS risk_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create risks table
CREATE TABLE IF NOT EXISTS risks (
    risk_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    risk_level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    status ENUM('Identified', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Identified',
    category_id INT,
    department_id INT,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES risk_categories(category_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- Insert sample departments
INSERT INTO departments (department_name, description) VALUES
('IT Department', 'Information Technology Department'),
('Finance', 'Financial Operations Department'),
('Operations', 'Business Operations Department'),
('HR', 'Human Resources Department');

-- Insert enhanced roles with detailed permissions
INSERT INTO roles (role_name, description, permissions) VALUES
('Admin', 'System Administrator with full control: manage users, assign roles, view/edit all data', '["users:read", "users:write", "users:delete", "users:admin", "roles:read", "roles:write", "roles:delete", "risks:read", "risks:write", "risks:delete", "departments:read", "departments:write", "departments:delete", "reports:read", "reports:write", "logs:read"]'),
('Risk Manager', 'Register risks, assign mitigations, monitor risks', '["risks:read", "risks:write", "risks:delete", "users:read", "departments:read", "reports:read", "reports:write"]'),
('Auditor', 'View logs, reports, risk history', '["risks:read", "reports:read", "logs:read", "users:read"]'),
('Department Head', 'Approve or reject risk assessments, oversee department risks', '["risks:read", "risks:write", "departments:read", "users:read", "reports:read"]'),
('Staff', 'Submit risk reports or suggestions', '["risks:read", "risks:write"]');

-- Insert admin user with hashed password (12345678)
-- Note: In production, use proper password hashing
INSERT INTO users (username, first_name, last_name, email, employee_id, department_id, password_hash) VALUES
('admin', 'System', 'Administrator', 'admin@admin.com', 'ADMIN001', 1, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');

-- Insert sample users
INSERT INTO users (username, first_name, last_name, email, employee_id, department_id) VALUES
('john.smith', 'John', 'Smith', 'john.smith@company.com', 'EMP002', 1),
('sarah.johnson', 'Sarah', 'Johnson', 'sarah.johnson@company.com', 'EMP003', 2),
('mike.davis', 'Mike', 'Davis', 'mike.davis@company.com', 'EMP004', 3);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Admin user gets Admin role
(2, 4), -- John Smith gets Department Head role
(3, 2), -- Sarah Johnson gets Risk Manager role
(4, 5); -- Mike Davis gets Staff role

-- Insert risk categories
INSERT INTO risk_categories (category_name, description) VALUES
('Financial', 'Financial risks including costs, revenue impacts, and budget overruns'),
('Security', 'Security and data protection risks'),
('Operational', 'Operational and process-related risks'),
('Technical', 'Technical and infrastructure risks'),
('Compliance', 'Regulatory and compliance risks');

-- Insert sample risks
INSERT INTO risks (title, description, risk_level, category_id, department_id, owner_id) VALUES
('Data Breach Risk', 'Potential security vulnerability in user authentication system', 'High', 2, 1, 2),
('Budget Overrun', 'Project costs exceeding allocated budget', 'Medium', 1, 2, 3);

SELECT 'Database setup completed successfully!' as status;
