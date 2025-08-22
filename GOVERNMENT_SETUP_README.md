# Government Risk Management System - Setup Guide

## Overview
This is an official government risk management platform designed for secure, compliant risk assessment and mitigation operations. The system provides role-based access control with administrative oversight.

## System Requirements
- MySQL 8.0 or higher
- Node.js 16+ 
- npm or yarn package manager

## Quick Setup

### 1. Database Setup
Run the database setup script to create all necessary tables and the admin user:

**Windows (Command Prompt):**
```cmd
setup_admin.bat
```

**Windows (PowerShell):**
```powershell
.\setup_admin.ps1
```

**Manual MySQL:**
```sql
-- Run the main setup
mysql -u root -p < setup_database.sql

-- Create admin user
mysql -u root -p < create_admin_user.sql
```

### 2. Admin User Created
After running the setup, you will have access to:

- **Email:** admin@admin.com
- **Password:** 12345678
- **Role:** Administrator (Full system access)

### 3. Start the Application

**Backend Server:**
```bash
npm run server:prisma
```

**Frontend (in new terminal):**
```bash
npm start
```

## Access URLs
- **Landing Page:** http://localhost:3000/
- **Login:** http://localhost:3000/login
- **Admin Dashboard:** http://localhost:3000/admin/dashboard (after login)

## User Roles & Permissions

### Administrator
- Full system access
- User management
- Role assignment
- System configuration
- All data access

### Risk Manager
- Risk assessment and monitoring
- User oversight
- Department risk management
- Reporting capabilities

### Department Head
- Department risk oversight
- Risk assessment approval
- User management within department
- Reporting access

### Auditor
- Read-only access to all data
- Audit logs and reports
- Risk history review
- Compliance monitoring

### Staff
- Submit risk reports
- View own submissions
- Basic risk management tools

## Security Features
- Role-based access control (RBAC)
- Secure authentication
- Protected routes
- Government-grade security standards
- Audit logging

## Database Schema
The system uses the following main tables:
- `users` - User accounts and profiles
- `roles` - System roles and permissions
- `user_roles` - User-role assignments
- `departments` - Organizational structure
- `risks` - Risk assessments and reports
- `risk_categories` - Risk classification

## Support
For technical support or access requests, contact your system administrator.

---
**Official Government System - For Official Use Only**

