# Risk Management System - User Management

## 🎯 Overview

This system provides a comprehensive role-based access control (RBAC) system for risk management with different user roles and permissions.

## 👥 User Roles & Permissions

### 1. **Admin** - Full System Control
- **Permissions**: Full access to all system features
- **Responsibilities**:
  - Manage all users and their roles
  - Assign and modify user permissions
  - View and edit all data
  - System administration and monitoring
  - Approve new user registrations

### 2. **Risk Manager** - Risk Management Specialist
- **Permissions**: Register risks, assign mitigations, monitor risks
- **Responsibilities**:
  - Create and manage risk assessments
  - Assign risk owners and managers
  - Monitor risk status and progress
  - Generate risk reports
  - Coordinate risk mitigation efforts

### 3. **Department Head** - Department Oversight
- **Permissions**: Approve/reject risk assessments, oversee department risks
- **Responsibilities**:
  - Review and approve risk assessments
  - Oversee department-specific risks
  - Manage department risk portfolio
  - Coordinate with risk managers

### 4. **Auditor** - Compliance & Monitoring
- **Permissions**: View logs, reports, risk history
- **Responsibilities**:
  - Review risk management processes
  - Audit risk assessments and mitigations
  - Generate compliance reports
  - Monitor system activity

### 5. **Staff/User** - Basic Risk Reporting
- **Permissions**: Submit risk reports or suggestions
- **Responsibilities**:
  - Report new risks and issues
  - Provide risk details and context
  - Follow up on reported risks
  - View status of their submissions

## 🔐 Authentication System

### Login Credentials

#### Admin User (Pre-configured)
- **Email**: `admin@admin.com`
- **Password**: `12345678`
- **Access**: Full admin dashboard

#### Demo Users
- **Risk Manager**: `sarah.johnson@company.com` (any password)
- **Department Head**: `john.smith@company.com` (any password)
- **Staff**: `mike.davis@company.com` (any password)

### Registration Process
1. New users register with basic information
2. Admin reviews and approves registrations
3. Users are assigned default "Staff" role
4. Admin can elevate roles based on responsibilities

## 🚀 Getting Started

### 1. Database Setup
```bash
# Run the database setup script
mysql -u root -p < setup_database.sql
```

### 2. Start the Backend Server
```bash
npm run server:prisma
```

### 3. Start the Frontend
```bash
npm run dev
```

### 4. Access the System
- **Login Page**: `http://localhost:5173/login`
- **Registration**: `http://localhost:5173/register`
- **Admin Dashboard**: `http://localhost:5173/admin/dashboard`
- **Staff Dashboard**: `http://localhost:5173/dashboard`

## 📱 User Experience Flow

### For New Users
1. **Register** → Fill out registration form
2. **Wait for Approval** → Admin reviews and activates account
3. **Login** → Access staff dashboard
4. **Submit Risks** → Report new risks and issues
5. **Track Progress** → Monitor status of submissions

### For Admins
1. **Login** → Access admin dashboard
2. **Review Users** → Check new registrations
3. **Manage Roles** → Assign appropriate permissions
4. **Monitor System** → Track overall system health
5. **User Management** → Activate/deactivate users

## 🛡️ Security Features

- **Role-based Access Control**: Users only see what they're authorized to access
- **JWT Authentication**: Secure token-based authentication
- **Password Protection**: Secure password handling (demo uses basic validation)
- **Session Management**: Automatic logout and token expiration
- **Input Validation**: Server-side validation of all user inputs

## 🔧 Technical Implementation

### Frontend Components
- `LoginPage.jsx` - User authentication
- `RegisterPage.jsx` - New user registration
- `AdminDashboard.jsx` - Full system administration
- `StaffDashboard.jsx` - Basic user dashboard
- `RiskForm.jsx` - Risk submission form

### Backend Endpoints
- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/admin/users` - User management
- `/api/admin/roles` - Role management
- `/api/admin/departments` - Department management

### Database Schema
- **users** - User information and credentials
- **roles** - Role definitions and permissions
- **user_roles** - User-role assignments
- **departments** - Organizational structure
- **risks** - Risk reports and assessments

## 📊 Dashboard Features

### Admin Dashboard
- **Overview**: System statistics and metrics
- **User Management**: Add, edit, and manage users
- **Role Management**: View and configure roles
- **Department Management**: Organizational structure
- **System Monitoring**: Health checks and status

### Staff Dashboard
- **Overview**: Personal risk reporting statistics
- **My Risk Reports**: View submitted risks
- **Submit Risk**: Create new risk reports
- **Guidelines**: Risk reporting instructions

## 🚨 Important Notes

### Demo Mode
- This system is configured for demonstration purposes
- Admin password is hardcoded as `12345678`
- New users can register with any password
- All existing demo users accept any password

### Production Considerations
- Implement proper password hashing (bcrypt)
- Add email verification for new registrations
- Implement proper session management
- Add audit logging for all admin actions
- Implement rate limiting and security headers

## 🔄 Role Elevation Process

### How Admins Elevate User Roles
1. **Access Admin Dashboard** → Navigate to User Management
2. **Select User** → Choose user to modify
3. **Change Role** → Assign new role from dropdown
4. **Update Status** → Activate inactive users
5. **Save Changes** → Changes take effect immediately

### Role Hierarchy
```
Admin (Full Access)
├── Risk Manager (Risk Management)
├── Department Head (Department Oversight)
├── Auditor (Compliance & Monitoring)
└── Staff (Basic Reporting)
```

## 📞 Support & Troubleshooting

### Common Issues
1. **Login Failed**: Check email/password, ensure user is active
2. **Access Denied**: Verify user has appropriate role permissions
3. **Registration Error**: Check for duplicate email/employee ID
4. **Dashboard Not Loading**: Verify authentication token is valid

### Getting Help
- Check browser console for error messages
- Verify database connection and schema
- Ensure all required environment variables are set
- Check server logs for backend errors

## 🎉 Success Metrics

- **User Adoption**: Number of active users
- **Risk Reporting**: Volume of submitted risks
- **Response Time**: Time from risk submission to review
- **User Satisfaction**: Feedback on system usability
- **System Uptime**: Overall system reliability

---

**System Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: Development Team

