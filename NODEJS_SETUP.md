# Risk Management System - Node.js Backend Setup

## 🚀 Overview

Your Risk Management System has been successfully migrated from PHP to a fully Node.js backend! This provides better performance, modern development experience, and seamless integration with your React frontend.

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Server**: `backend/server.js` - Main Express server
- **Database**: MySQL via XAMPP
- **Authentication**: JWT-based with bcrypt password hashing
- **Port**: 5000 (configurable via environment variables)

### Frontend (React)
- **API Service**: `src/services/api.js` - Centralized API communication
- **Components**: Updated to use Node.js backend instead of localStorage
- **State Management**: Real-time data from database

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **XAMPP** with MySQL running
3. **Database**: `risk_management` database with proper schema

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
```bash
npm run server
```
This will start the Node.js server on port 5000.

### 3. Start the Frontend (in a new terminal)
```bash
npm run dev
```
This will start the React development server.

### 4. Run Both Together
```bash
npm run dev:full
```
This runs both backend and frontend concurrently.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/health` - Health check

### Risks Management
- `GET /api/risks` - Get all risks
- `GET /api/risks/:id` - Get single risk
- `POST /api/risks` - Create new risk
- `PUT /api/risks/:id` - Update risk
- `DELETE /api/risks/:id` - Delete risk

### Reference Data
- `GET /api/categories` - Get risk categories
- `GET /api/departments` - Get departments
- `GET /api/users` - Get users

## 🧪 Testing the Backend

Run the test script to verify everything is working:
```bash
node test-backend.js
```

This will test all API endpoints and show you the results.

## 🔧 Configuration

### Database Configuration
The backend connects to your XAMPP MySQL database. Update these settings in `backend/server.js` if needed:

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password
  database: 'risk_management'
};
```

### Environment Variables
Create a `.env` file in the root directory for production settings:

```env
PORT=5000
JWT_SECRET=your-super-secret-key-here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=risk_management
```

## 📱 Frontend Integration

### API Service
The frontend now uses `src/services/api.js` for all backend communication:

```javascript
import { risksAPI, referenceAPI, authAPI } from '../services/api';

// Get all risks
const risks = await risksAPI.getAll();

// Create new risk
const newRisk = await risksAPI.create(riskData);

// Get reference data
const categories = await referenceAPI.getCategories();
```

### Component Updates
All components have been updated to:
- Use the API service instead of localStorage
- Handle loading and error states
- Provide real-time data from the database

## 🗄️ Database Schema

Make sure your database has these tables:
- `users` - User accounts and authentication
- `departments` - Organizational units
- `risk_categories` - Risk classification categories
- `risks` - Main risk records
- `user_roles` - Role-based access control
- `roles` - Available roles and permissions

## 🚨 Troubleshooting

### Common Issues

1. **"Database connection failed"**
   - Ensure XAMPP MySQL is running
   - Check database credentials in `backend/server.js`
   - Verify database `risk_management` exists

2. **"Port 5000 already in use"**
   - Change port in `backend/server.js` or `.env` file
   - Kill existing process using the port

3. **"CORS error"**
   - Check CORS configuration in `backend/server.js`
   - Ensure frontend URL is in allowed origins

4. **"Module not found"**
   - Run `npm install` to install dependencies
   - Check `package.json` for missing packages

### Debug Mode
Enable detailed logging by adding this to `backend/server.js`:

```javascript
// Add before app.listen
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configured for specific origins
- **SQL Injection Prevention**: Prepared statements
- **Input Validation**: Comprehensive field validation

## 📈 Performance Benefits

- **Connection Pooling**: Efficient database connections
- **Async/Await**: Modern JavaScript patterns
- **Error Handling**: Comprehensive error management
- **Real-time Updates**: Live data from database

## 🎯 Next Steps

1. **Test the system** with `node test-backend.js`
2. **Start development** with `npm run dev:full`
3. **Add authentication** to your frontend components
4. **Implement real-time updates** using WebSockets (optional)
5. **Add more API endpoints** as needed

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify database connectivity
3. Test individual API endpoints
4. Review the troubleshooting section above

---

**🎉 Congratulations!** You now have a modern, scalable Node.js backend for your Risk Management System.
