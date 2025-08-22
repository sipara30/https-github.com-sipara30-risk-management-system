# Risk Management Dashboard

A modern, interactive React application for enterprise risk management with real-time data visualization and comprehensive risk tracking capabilities.

## 🚀 Features

### Interactive Risk Management
- **Add New Risks**: Create comprehensive risk entries with detailed information
- **Edit Existing Risks**: Modify risk details, status, and metadata
- **Delete Risks**: Remove risks with confirmation dialogs
- **Status Updates**: Change risk status directly from the dashboard (Open, In Progress, Resolved, Closed)

### Advanced Filtering & Search
- **Real-time Search**: Search across risk titles, descriptions, and owners
- **Multi-criteria Filtering**: Filter by status, severity, and category
- **Clear Filters**: Reset all filters with one click
- **Dynamic Results**: See filtered results update instantly

### Risk Categories & Severity Levels
- **Categories**: Technical, Operational, Financial, Strategic, Compliance, Security
- **Severity Levels**: Low, Medium, High, Critical with color-coded indicators
- **Visual Indicators**: Color-coded badges for quick risk assessment

### Data Visualization
- **Interactive Charts**: Bar charts showing risks by status and severity
- **Real-time Updates**: Charts update automatically when data changes
- **Responsive Design**: Charts adapt to different screen sizes

### Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Interactive Elements**: Hover effects, transitions, and smooth animations
- **User-friendly Navigation**: Intuitive layout with clear visual hierarchy

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd risk-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🎯 How to Use

### Adding a New Risk
1. Click the "Add New Risk" button in the top-right corner
2. Fill in the required fields (Title and Description)
3. Select appropriate category, severity, and status
4. Add owner information and due date (optional)
5. Include additional notes if needed
6. Click "Add Risk" to save

### Editing a Risk
1. Click the "Edit" button on any risk card
2. Modify the desired fields
3. Click "Update Risk" to save changes

### Filtering and Searching
1. Use the search bar to find risks by title, description, or owner
2. Use dropdown filters to narrow by status, severity, or category
3. Click "Clear Filters" to reset all filters

### Managing Risk Status
1. Expand a risk card by clicking "Show More"
2. Use the status dropdown to change the risk status
3. Changes are saved automatically

### Viewing Analytics
- Charts automatically display at the top of the dashboard
- View risk distribution by status and severity
- Charts update in real-time as you modify risks

## 📊 Sample Data

The application comes pre-loaded with sample risks covering various scenarios:
- Data Breach Risk (Security, High severity)
- Server Downtime (Technical, Medium severity)
- Budget Overrun (Financial, Medium severity)
- Compliance Violation (Compliance, Critical severity)
- Key Personnel Loss (Operational, High severity)

## 🎨 Customization

### Adding New Categories
Edit the `RiskForm.jsx` and `RiskFilters.jsx` files to add new risk categories.

### Modifying Severity Levels
Update the severity options in the form components and adjust color schemes in `RiskCard.jsx`.

### Styling Changes
Modify Tailwind CSS classes throughout the components to match your brand colors and design preferences.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using React and Tailwind CSS** 

## 🚨 Troubleshooting

### Backend Won't Start
1. Check if port 5000 is available
2. Verify `.env` file exists and has correct values
3. Ensure database is accessible
4. Check for syntax errors in server code

### Frontend Won't Load
1. Verify backend is running on port 5000
2. Check browser console for errors
3. Ensure all dependencies are installed
4. Try clearing browser cache

### Database Issues
1. Verify DATABASE_URL in `.env`
2. Check database connection
3. Run `npx prisma db push` to sync schema
4. Use Prisma Studio to inspect database

### Role Assignment Not Working
1. Ensure user is in 'pending' status
2. Check if roles and dashboard sections are loaded
3. Verify backend endpoints are working
4. Check browser console for JavaScript errors

## 🚨 Detailed Problem Solutions

### 1. Registration Form "All fields are required" Error

**Error Message**: `"All fields are required"` appears even when all visible fields are filled

**Root Cause**: Backend validation was checking for `employeeId` and `departmentId` fields that weren't sent by the frontend

**Solution**: ✅ Fixed - Backend now only validates: `firstName`, `lastName`, `email`, `password`

**Prevention**: Ensure backend validation matches frontend form fields exactly

---

### 2. Frontend Blank Page / Build Errors

**Error Message**: 
```
Build failed with errors
ReferenceError: updateUserRole is not defined
ReferenceError: updateUserStatus is not defined
```

**Root Cause**: API functions were defined in `adminAPI` object but not individually exported

**Solution**: ✅ Fixed - Added individual exports for all API functions

**Prevention**: Always export functions individually when they're used in other components

---

### 3. "Expected JSON response but got text/html" Error

**Error Message**: 
```
❌ API Error: Expected JSON response but got text/html
💥 API call failed: Error: Route not found
```

**Root Cause**: Frontend calling protected backend endpoints without authentication tokens

**Solution**: ✅ Fixed - Added authentication checks and proper error handling middleware

**Prevention**: Ensure all API calls include proper authentication headers

---

### 4. Database Connection Pool Timeout (P2024)

**Error Message**: 
```
Prisma Client error: P2024: The connection pool timed out
```

**Root Cause**: Database connection string issues or network connectivity problems

**Solutions**:
- Ensure `.env` file is in root directory (not backend/)
- Verify DATABASE_URL format is correct
- Check if using Prisma Data Platform vs local database
- Add connection retry logic

**Prevention**: Use proper connection pooling and error handling in Prisma client initialization

---

### 5. Database Server Unreachable (P1001)

**Error Message**: 
```
Prisma Client error: P1001: Can't reach database server
```

**Root Cause**: Database server is down or network issues

**Solutions**:
- Verify database server is running
- Check firewall settings
- Ensure DATABASE_URL points to correct host/port
- Test database connectivity manually

---

### 6. Express.js "Missing parameter name" Error

**Error Message**: 
```
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
```

**Root Cause**: Express v5 compatibility issues with `path-to-regexp`

**Solution**: ✅ Fixed - Downgraded to Express v4.18.2

**Prevention**: Test Express version compatibility before upgrading

---

### 7. Prisma EPERM Error on Windows

**Error Message**: 
```
EPERM: operation not permitted, rename
```

**Root Cause**: File permission issues during `prisma generate` on Windows

**Solutions**:
- Close all IDEs and file managers
- Run terminal as administrator
- Database will work with existing Prisma client
- Try again after system restart

**Prevention**: Close all file access before running Prisma commands

---

### 8. Admin Dashboard Not Showing Pending Users

**Error Message**: No error, but pending users don't appear in the list

**Root Cause**: User `status` field was missing or set to "verified" instead of "pending"

**Solutions**:
- Run `update-user-status.js` script to fix existing users
- Ensure new users get `status: 'pending'` by default
- Check database schema has `status` field
- Use Prisma Studio to manually update user statuses

**Prevention**: Always set default status in database schema and registration logic

---

### 9. "Failed to load dashboard data: Route not found" for getSystemHealth

**Error Message**: 
```
Failed to load dashboard data: Route not found
```

**Root Cause**: Frontend calling `getSystemHealth` function that was removed from backend

**Solution**: ✅ Fixed - Removed unused system health calls

**Prevention**: Keep frontend and backend API functions in sync

---

### 10. "Failed to load dashboard data: getUsers is not defined"

**Error Message**: 
```
Dashboard data load error: ReferenceError: getUsers is not defined
```

**Root Cause**: Missing import for `getUsers` function in AdminDashboard

**Solution**: ✅ Fixed - Added proper imports for all API functions

**Prevention**: Always verify imports match function usage

---

### 11. TypeError: Cannot read properties of undefined (reading 'includes')

**Error Message**: 
```
Uncaught TypeError: Cannot read properties of undefined (reading 'includes')
at AdminDashboard.jsx:1077:71
```

**Root Cause**: `roleAssignmentForm.allowedSections` was undefined when checking checkbox state

**Solutions**:
- ✅ Fixed - Added `useEffect` to initialize `allowedSections` as empty array
- ✅ Fixed - Added safety checks using `(roleAssignmentForm.allowedSections || [])`
- ✅ Fixed - Added `Array.isArray()` checks before mapping

**Prevention**: Always initialize state objects with proper default values

---

### 12. Prisma Schema Sync Issues

**Error Message**: 
```
TypeError: Cannot read properties of undefined (reading 'findMany') for prisma.dashboard_sections
```

**Root Cause**: Database schema not synced with Prisma client after adding new tables

**Solutions**:
- Run `node update-database.js` to add new columns/tables
- Run `npx prisma db push` to sync schema
- Run `npx prisma generate` to update client (may fail on Windows)
- Restart backend server

**Prevention**: Always run schema updates after making database changes

---

### 13. Role Assignment Modal Not Visible

**Error Message**: No error, but role assignment modal doesn't appear

**Root Cause**: JavaScript errors preventing modal from rendering

**Solutions**:
- Check browser console for errors
- Ensure all required state variables are initialized
- Verify modal JSX is properly structured
- Check if `showRoleAssignmentModal` state is being set

**Prevention**: Add error boundaries and proper state validation

---

### 14. Database Seeding Failures

**Error Message**: 
```
Error during seeding: [specific error]
```

**Root Cause**: Database schema mismatch or connection issues

**Solutions**:
- Ensure database schema is up-to-date
- Check database connection
- Verify seed script has correct imports
- Run `npx prisma db push` before seeding

**Prevention**: Always sync schema before running seed scripts

---

### 15. Frontend Authentication Redirects

**Error Message**: Users redirected to login even when authenticated

**Root Cause**: JWT token validation or storage issues

**Solutions**:
- Check localStorage for valid authToken
- Verify JWT_SECRET matches between frontend/backend
- Check token expiration
- Ensure proper token format in requests

**Prevention**: Implement proper token refresh and validation logic

## 🔧 Emergency Fixes

### If Nothing Works - Complete Reset

```bash
# 1. Stop all servers
# 2. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Reset database schema
npx prisma db push --force-reset

# 4. Reseed database
node prisma/seed.js

# 5. Restart servers
npm run server:prisma
# In new terminal:
npm run dev
```

### Database Connection Emergency

```bash
# If database is completely unreachable:
# 1. Check .env file location (must be in root)
# 2. Verify DATABASE_URL format
# 3. Test connection manually
# 4. Check firewall/network settings
# 5. Contact database provider if using cloud service
```

## 📞 Getting Help

When reporting issues, include:

1. **Exact error message** from console/terminal
2. **Steps to reproduce** the problem
3. **Environment details** (OS, Node version, etc.)
4. **Database type** (local PostgreSQL vs Prisma Data Platform)
5. **Console logs** from both frontend and backend

---

**Remember**: Most issues stem from database connectivity, schema mismatches, or missing environment variables. Always check these first! 