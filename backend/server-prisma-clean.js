import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Initialize Prisma with connection pool configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool configuration
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Initialize database connection
testDatabaseConnection();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware - More permissive CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Global CORS headers for all requests
app.use((req, res, next) => {
  // Allow all origins in development
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      message: 'Server and database are running',
      timestamp: new Date().toISOString(),
      cors: 'enabled',
      origin: req.headers.origin || 'unknown'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        departments: true,
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, accept any password for existing users
    // In production, verify password hash properly
    if (user.password_hash && password !== '12345678') {
      // Basic password check for demo - replace with proper bcrypt verification
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        roles: user.user_roles.map(ur => ur.roles.role_name)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        department: user.departments?.department_name || 'Not Assigned',
        roles: user.user_roles.map(ur => ur.roles.role_name)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, employeeId, departmentId, password } = req.body;

    if (!firstName || !lastName || !email || !employeeId || !departmentId || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email },
          { employee_id: employeeId }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or employee ID already exists' });
    }

    // Create new user (initially inactive, waiting for admin approval)
    const newUser = await prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        employee_id: employeeId,
        department_id: parseInt(departmentId),
        status: 'inactive', // Requires admin approval
        username: email.split('@')[0] // Generate username from email
      }
    });

    // Assign default Staff role
    const staffRole = await prisma.roles.findFirst({
      where: { role_name: 'Staff' }
    });

    if (staffRole) {
      await prisma.user_roles.create({
        data: {
          user_id: newUser.id,
          role_id: staffRole.id
        }
      });
    }

    res.status(201).json({ 
      message: 'Registration successful. Please wait for admin approval.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Risks endpoints
app.get('/api/risks', async (req, res) => {
  try {
    const risks = await prisma.risks.findMany({
      include: {
        risk_categories: true,
        departments: true,
        users_risks_risk_owner_idTousers: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        },
        users_risks_risk_manager_idTousers: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    // Transform data to match frontend expectations
    const transformedRisks = risks.map(risk => ({
      id: risk.id,
      code: risk.risk_code,
      title: risk.risk_title,
      description: risk.risk_description,
      whatCanHappen: risk.what_can_happen,
      category: risk.risk_categories?.category_name || 'Not Assigned',
      categoryId: risk.risk_category_id,
      department: risk.departments?.department_name || 'Not Assigned',
      departmentId: risk.department_id,
      owner: risk.users_risks_risk_owner_idTousers ? `${risk.users_risks_risk_owner_idTousers.first_name} ${risk.users_risks_risk_owner_idTousers.last_name}` : 'Not Assigned',
      ownerId: risk.risk_owner_id,
      manager: risk.users_risks_risk_manager_idTousers ? `${risk.users_risks_risk_manager_idTousers.first_name} ${risk.users_risks_risk_manager_idTousers.last_name}` : 'Not Assigned',
      managerId: risk.risk_manager_id,
      status: risk.status,
      priority: risk.priority,
      identifiedDate: risk.identified_date,
      lastReviewDate: risk.last_review_date,
      nextReviewDate: risk.next_review_date,
      documentationStatus: risk.documentation_status,
      createdAt: risk.created_at,
      updatedAt: risk.updated_at
    }));

    res.json(transformedRisks);
  } catch (error) {
    console.error('Risks fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

app.get('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const risk = await prisma.risks.findUnique({
      where: { id: parseInt(id) },
      include: {
        risk_categories: true,
        departments: true,
        users_risks_risk_owner_idTousers: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        },
        users_risks_risk_manager_idTousers: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!risk) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    // Transform data to match frontend expectations
    const transformedRisk = {
      id: risk.id,
      code: risk.risk_code,
      title: risk.risk_title,
      description: risk.risk_description,
      whatCanHappen: risk.what_can_happen,
      category: risk.risk_categories?.category_name || 'Not Assigned',
      categoryId: risk.risk_category_id,
      department: risk.departments?.department_name || 'Not Assigned',
      departmentId: risk.department_id,
      owner: risk.users_risks_risk_owner_idTousers ? `${risk.users_risks_risk_owner_idTousers.first_name} ${risk.users_risks_risk_owner_idTousers.last_name}` : 'Not Assigned',
      ownerId: risk.risk_owner_id,
      manager: risk.users_risks_risk_manager_idTousers ? `${risk.users_risks_risk_manager_idTousers.first_name} ${risk.users_risks_risk_manager_idTousers.last_name}` : 'Not Assigned',
      managerId: risk.risk_manager_id,
      status: risk.status,
      priority: risk.priority,
      identifiedDate: risk.identified_date,
      lastReviewDate: risk.last_review_date,
      nextReviewDate: risk.next_review_date,
      documentationStatus: risk.documentation_status,
      createdAt: risk.created_at,
      updatedAt: risk.updated_at
    };

    res.json(transformedRisk);
  } catch (error) {
    console.error('Risk fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch risk' });
  }
});

app.post('/api/risks', async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      whatCanHappen,
      categoryId,
      departmentId,
      ownerId,
      managerId,
      status,
      priority,
      identifiedDate,
      nextReviewDate,
      documentationStatus
    } = req.body;

    // Validation
    if (!code || !title || !description) {
      return res.status(400).json({ error: 'Code, title, and description are required' });
    }

    // Check if code already exists
    const existingRisk = await prisma.risks.findUnique({
      where: { risk_code: code }
    });

    if (existingRisk) {
      return res.status(400).json({ error: 'Risk code already exists' });
    }

    const risk = await prisma.risks.create({
      data: {
        risk_code: code,
        risk_title: title,
        risk_description: description,
        what_can_happen: whatCanHappen,
        risk_category_id: categoryId ? parseInt(categoryId) : null,
        department_id: departmentId ? parseInt(departmentId) : null,
        risk_owner_id: ownerId ? parseInt(ownerId) : null,
        risk_manager_id: managerId ? parseInt(managerId) : null,
        status: status || 'Identified',
        priority: priority || 'Medium',
        identified_date: identifiedDate ? new Date(identifiedDate) : new Date(),
        next_review_date: nextReviewDate ? new Date(nextReviewDate) : null,
        documentation_status: documentationStatus || 'Draft'
      }
    });

    res.status(201).json({
      message: 'Risk created successfully',
      risk: {
        id: risk.id,
        code: risk.risk_code,
        title: risk.risk_title
      }
    });
  } catch (error) {
    console.error('Risk creation error:', error);
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

// Admin endpoints
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching users from database...');
    
    // Test connection first
    await prisma.$queryRaw`SELECT 1`;
    
    const users = await prisma.users.findMany({
      include: {
        departments: true,
        user_roles: {
          include: {
            roles: true
          }
        }
      },
      orderBy: {
        first_name: 'asc'
      }
    });

    const transformedUsers = users.map(user => ({
      id: user.id,
      employeeId: user.employee_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      department: user.departments?.department_name || 'Not Assigned',
      status: user.employment_status,
      roles: user.user_roles.map(ur => ur.roles.role_name)
    }));

    console.log(`✅ Successfully fetched ${users.length} users`);
    res.json(transformedUsers);
  } catch (error) {
    console.error('❌ Users fetch error:', error);
    
    // Check if it's a connection issue
    if (error.code === 'P2024') {
      console.log('🔄 Attempting to reconnect to database...');
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('✅ Database reconnected successfully');
        
        // Retry the query
        const users = await prisma.users.findMany({
          include: {
            departments: true,
            user_roles: {
              include: {
                roles: true
              }
            }
          },
          orderBy: {
            first_name: 'asc'
          }
        });

        const transformedUsers = users.map(user => ({
          id: user.id,
          employeeId: user.employee_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          department: user.departments?.department_name || 'Not Assigned',
          status: user.employment_status,
          roles: user.user_roles.map(ur => ur.roles.role_name)
        }));

        console.log(`✅ Successfully fetched ${users.length} users after reconnection`);
        res.json(transformedUsers);
        return;
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        res.status(500).json({ 
          error: 'Database connection failed after retry',
          details: retryError.message 
        });
        return;
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message,
      code: error.code 
    });
  }
});

app.get('/api/admin/roles', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching roles from database...');
    
    // Test connection first
    await prisma.$queryRaw`SELECT 1`;
    
    const roles = await prisma.roles.findMany({
      orderBy: {
        role_name: 'asc'
      }
    });
    
    console.log(`✅ Successfully fetched ${roles.length} roles`);
    res.json(roles);
  } catch (error) {
    console.error('❌ Roles fetch error:', error);
    
    // Check if it's a connection issue
    if (error.code === 'P2024') {
      console.log('🔄 Attempting to reconnect to database...');
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('✅ Database reconnected successfully');
        
        // Retry the query
        const roles = await prisma.roles.findMany({
          orderBy: {
            role_name: 'asc'
          }
        });
        console.log(`✅ Successfully fetched ${roles.length} roles after reconnection`);
        res.json(roles);
        return;
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        res.status(500).json({ 
          error: 'Database connection failed after retry',
          details: retryError.message 
        });
        return;
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch roles',
      details: error.message,
      code: error.code 
    });
  }
});

app.get('/api/admin/departments', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching departments from database...');
    
    // Test connection first
    await prisma.$queryRaw`SELECT 1`;
    
    const departments = await prisma.departments.findMany({
      orderBy: {
        department_name: 'asc'
      }
    });
    
    console.log(`✅ Successfully fetched ${departments.length} departments`);
    res.json(departments);
  } catch (error) {
    console.error('❌ Departments fetch error:', error);
    
    // Check if it's a connection issue
    if (error.code === 'P2024') {
      console.log('🔄 Attempting to reconnect to database...');
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('✅ Database reconnected successfully');
        
        // Retry the query
        const departments = await prisma.departments.findMany({
          orderBy: {
            department_name: 'asc'
          }
        });
        console.log(`✅ Successfully fetched ${departments.length} departments after reconnection`);
        res.json(departments);
        return;
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        res.status(500).json({ 
          error: 'Database connection failed after retry',
          details: retryError.message 
        });
        return;
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch departments',
      details: error.message,
      code: error.code 
    });
  }
});

// Create new department
app.post('/api/admin/departments', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const newDepartment = await prisma.departments.create({
      data: {
        department_name: name.trim(),
        description: description || '',
        created_at: new Date()
      }
    });

    res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Department creation error:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Create new role
app.post('/api/admin/roles', authenticateToken, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const newRole = await prisma.roles.create({
      data: {
        role_name: name.trim(),
        description: description || '',
        permissions: permissions ? JSON.stringify(permissions) : '[]',
        created_at: new Date()
      }
    });

    res.status(201).json(newRole);
  } catch (error) {
    console.error('Role creation error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    // Remove existing role assignments
    await prisma.user_roles.deleteMany({
      where: { user_id: parseInt(id) }
    });

    // Assign new role
    await prisma.user_roles.create({
      data: {
        user_id: parseInt(id),
        role_id: parseInt(roleId)
      }
    });

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

app.put('/api/admin/users/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await prisma.users.update({
      where: { id: parseInt(id) },
      data: { employment_status: status }
    });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Create new user
app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, employeeId, departmentId, roleId, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !employeeId || !departmentId || !roleId) {
      return res.status(400).json({ error: 'All fields are required except password' });
    }

    // Generate a default password if none provided
    const defaultPassword = password || '12345678';

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email },
          { employee_id: employeeId }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or employee ID already exists' });
    }

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        employee_id: employeeId.trim(),
        department_id: parseInt(departmentId),
        employment_status: 'Active',
        password_hash: defaultPassword, // Using default password for demo
        created_at: new Date()
      }
    });

    // Assign role
    await prisma.user_roles.create({
      data: {
        user_id: newUser.id,
        role_id: parseInt(roleId)
      }
    });

    // Fetch the created user with department and role info
    const createdUser = await prisma.users.findUnique({
      where: { id: newUser.id },
      include: {
        departments: true,
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    const transformedUser = {
      id: createdUser.id,
      employeeId: createdUser.employee_id,
      firstName: createdUser.first_name,
      lastName: createdUser.last_name,
      email: createdUser.email,
      department: createdUser.departments?.department_name || 'Not Assigned',
      status: createdUser.employment_status,
      roles: createdUser.user_roles.map(ur => ur.roles.role_name)
    };

    res.status(201).json({
      message: 'User created successfully',
      user: transformedUser
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user
app.delete('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user roles first (due to foreign key constraints)
    await prisma.user_roles.deleteMany({
      where: { user_id: parseInt(userId) }
    });

    // Delete the user
    await prisma.users.delete({
      where: { id: parseInt(userId) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user
app.put('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, employeeId, departmentId } = req.body;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(userId) },
      data: {
        first_name: firstName?.trim(),
        last_name: lastName?.trim(),
        email: email?.trim(),
        employee_id: employeeId?.trim(),
        department_id: departmentId ? parseInt(departmentId) : undefined
      }
    });

    res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user role
app.put('/api/admin/users/:userId/role', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if role exists
    const role = await prisma.roles.findUnique({
      where: { id: parseInt(roleId) }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Delete existing user roles
    await prisma.user_roles.deleteMany({
      where: { user_id: parseInt(userId) }
    });

    // Assign new role
    await prisma.user_roles.create({
      data: {
        user_id: parseInt(userId),
        role_id: parseInt(roleId)
      }
    });

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('User role update error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Update user status
app.put('/api/admin/users/:userId/status', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user status
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(userId) },
      data: {
        employment_status: status
      }
    });

    res.json({ 
      message: 'User status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// System health endpoint for admin dashboard
app.get('/api/admin/system-health', authenticateToken, async (req, res) => {
  try {
    // Get basic system metrics
    const userCount = await prisma.users.count();
    const roleCount = await prisma.roles.count();
    const departmentCount = await prisma.departments.count();
    
    // Simulate system health data
    const systemHealth = {
      serverStatus: 'Online',
      databaseStatus: 'Connected',
      lastBackup: '2 hours ago',
      activeConnections: Math.floor(Math.random() * 20) + 5,
      memoryUsage: `${Math.floor(Math.random() * 30) + 50}%`,
      diskUsage: `${Math.floor(Math.random() * 40) + 30}%`,
      errorCount: 0,
      uptime: '7 days, 3 hours',
      metrics: {
        totalUsers: userCount,
        totalRoles: roleCount,
        totalDepartments: departmentCount
      }
    };

    res.json(systemHealth);
  } catch (error) {
    console.error('System health fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

// Categories endpoints for admin
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.risk_categories.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = await prisma.risk_categories.create({
      data: {
        category_name: name.trim(),
        description: description || '',
        created_at: new Date()
      }
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Reference data endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.risk_categories.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const departments = await prisma.departments.findMany();
    res.json(departments);
  } catch (error) {
    console.error('Departments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        employee_id: true,
        department_id: true,
        position_id: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add missing roles endpoint
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        role_name: true,
        description: true,
        permissions: true,
        created_at: true
      }
    });
    res.json(roles);
  } catch (error) {
    console.error('Roles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Add missing admin users endpoint with full user data
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        employee_id: true,
        department_id: true,
        position_id: true,
        hire_date: true,
        employment_status: true,
        created_at: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add missing admin departments endpoint
app.get('/api/admin/departments', authenticateToken, async (req, res) => {
  try {
    const departments = await prisma.departments.findMany({
      select: {
        id: true,
        department_name: true,
        department_code: true,
        description: true,
        is_active: true,
        created_at: true
      }
    });
    res.json(departments);
  } catch (error) {
    console.error('Admin departments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Add missing admin roles endpoint
app.get('/api/admin/roles', authenticateToken, async (req, res) => {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        role_name: true,
        description: true,
        permissions: true,
        created_at: true
      }
    });
    res.json(roles);
  } catch (error) {
    console.error('Admin roles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Prisma PostgreSQL Backend running on port ${PORT}`);
  console.log(`📊 Database: PostgreSQL (Prisma Data Platform)`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📋 Risks endpoint: http://localhost:${PORT}/api/risks`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
