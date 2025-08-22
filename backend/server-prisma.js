import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors());
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
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: 'Database connection failed',
      details: error.message
    });
  }
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

// Reference data endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.risk_categories.findMany({
      where: { is_active: true },
      select: {
        id: true,
        category_name: true,
        category_code: true,
        description: true
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const departments = await prisma.departments.findMany({
      where: { is_active: true },
      select: {
        id: true,
        department_name: true,
        department_code: true,
        description: true
      }
    });
    res.json(departments);
  } catch (error) {
    console.error('Departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      where: { employment_status: 'Active' },
      select: {
        id: true,
        employee_id: true,
        first_name: true,
        last_name: true,
        email: true,
        departments: {
          select: {
            department_name: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Risk management endpoints
app.get('/api/risks', async (req, res) => {
  try {
    const risks = await prisma.risks.findMany({
      include: {
        risk_categories: true,
        departments: true,
        users_risks_risk_owner_idTousers: {
          select: {
            first_name: true,
            last_name: true
          }
        },
        users_risks_risk_manager_idTousers: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
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
      department: risk.departments?.department_name || 'Not Assigned',
      owner: risk.users_risks_risk_owner_idTousers ? `${risk.users_risks_risk_owner_idTousers.first_name} ${risk.users_risks_risk_owner_idTousers.last_name}` : 'Not Assigned',
      manager: risk.users_risks_risk_manager_idTousers ? `${risk.users_risks_risk_manager_idTousers.first_name} ${risk.users_risks_risk_manager_idTousers.last_name}` : 'Not Assigned',
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
        risk_category_id: categoryId || null,
        department_id: departmentId || null,
        risk_owner_id: ownerId || null,
        risk_manager_id: managerId || null,
        status: status || 'Identified',
        priority: priority || 'Medium',
        identified_date: identifiedDate ? new Date(identifiedDate) : null,
        next_review_date: nextReviewDate ? new Date(nextReviewDate) : null,
        documentation_status: documentationStatus || 'Draft'
      },
      include: {
        risk_categories: true,
        departments: true,
        users_risks_risk_owner_idTousers: {
          select: {
            first_name: true,
            last_name: true
          }
        },
        users_risks_risk_manager_idTousers: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      }
    });

    // Transform response
    const transformedRisk = {
      id: risk.id,
      code: risk.risk_code,
      title: risk.risk_title,
      description: risk.risk_description,
      whatCanHappen: risk.what_can_happen,
      category: risk.risk_categories?.category_name || 'Not Assigned',
      department: risk.departments?.department_name || 'Not Assigned',
      owner: risk.users_risks_risk_owner_idTousers ? `${risk.users_risks_risk_owner_idTousers.first_name} ${risk.users_risks_risk_owner_idTousers.last_name}` : 'Not Assigned',
      manager: risk.users_risks_risk_manager_idTousers ? `${risk.users_risks_risk_manager_idTousers.first_name} ${risk.users_risks_risk_manager_idTousers.last_name}` : 'Not Assigned',
      status: risk.status,
      priority: risk.priority,
      identifiedDate: risk.identified_date,
      nextReviewDate: risk.next_review_date,
      documentationStatus: risk.documentation_status,
      createdAt: risk.created_at
    };

    res.status(201).json(transformedRisk);
  } catch (error) {
    console.error('Risk creation error:', error);
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

app.put('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Convert date strings to Date objects
    if (updateData.identifiedDate) {
      updateData.identifiedDate = new Date(updateData.identifiedDate);
    }
    if (updateData.nextReviewDate) {
      updateData.nextReviewDate = new Date(updateData.nextReviewDate);
    }

    const risk = await prisma.risks.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        risk_categories: true,
        departments: true,
        users_risks_risk_owner_idTousers: {
          select: {
            first_name: true,
            last_name: true
          }
        },
        users_risks_risk_manager_idTousers: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      }
    });

    // Transform response
    const transformedRisk = {
      id: risk.id,
      code: risk.risk_code,
      title: risk.risk_title,
      description: risk.risk_description,
      whatCanHappen: risk.what_can_happen,
      category: risk.risk_categories?.category_name || 'Not Assigned',
      department: risk.departments?.department_name || 'Not Assigned',
      owner: risk.users_risks_risk_owner_idTousers ? `${risk.users_risks_risk_owner_idTousers.first_name} ${risk.users_risks_risk_owner_idTousers.last_name}` : 'Not Assigned',
      manager: risk.users_risks_risk_manager_idTousers ? `${risk.users_risks_risk_manager_idTousers.first_name} ${risk.users_risks_risk_manager_idTousers.last_name}` : 'Not Assigned',
      status: risk.status,
      priority: risk.priority,
      identifiedDate: risk.identified_date,
      nextReviewDate: risk.next_review_date,
      documentationStatus: risk.documentation_status,
      createdAt: risk.created_at,
      updatedAt: risk.updated_at
    };

    res.json(transformedRisk);
  } catch (error) {
    console.error('Risk update error:', error);
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

app.delete('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.risks.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    console.error('Risk deletion error:', error);
    res.status(500).json({ error: 'Failed to delete risk' });
  }
});

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        departments: true,
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/roles', async (req, res) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json(roles);
  } catch (error) {
    console.error('Roles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

app.get('/api/admin/departments', async (req, res) => {
  try {
    const departments = await prisma.departments.findMany();
    res.json(departments);
  } catch (error) {
    console.error('Departments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    // Remove existing roles
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

app.put('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await prisma.users.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
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

        risk_category_id: categoryId || null,

        department_id: departmentId || null,

        risk_owner_id: ownerId || null,

        risk_manager_id: managerId || null,

        status: status || 'Identified',

        priority: priority || 'Medium',

        identified_date: identifiedDate ? new Date(identifiedDate) : null,

        next_review_date: nextReviewDate ? new Date(nextReviewDate) : null,

        documentation_status: documentationStatus || 'Draft'

      },

      include: {

        risk_categories: true,

        departments: true,

        users_risks_risk_owner_idTousers: {

          select: {

            first_name: true,

            last_name: true

          }

        },

        users_risks_risk_manager_idTousers: {

          select: {

            first_name: true,

            last_name: true

          }

        }

      }

    });



    // Transform response

    const transformedRisk = {

      id: risk.id,

      code: risk.risk_code,

      title: risk.risk_title,

      description: risk.risk_description,

      whatCanHappen: risk.what_can_happen,

      category: risk.risk_categories?.category_name || 'Not Assigned',

      department: risk.departments?.department_name || 'Not Assigned',

      owner: risk.users_risks_risk_owner_idTousers ? `${risk.users_risks_risk_owner_idTousers.first_name} ${risk.users_risks_risk_owner_idTousers.last_name}` : 'Not Assigned',

      manager: risk.users_risks_risk_manager_idTousers ? `${risk.users_risks_risk_manager_idTousers.first_name} ${risk.users_risks_risk_manager_idTousers.last_name}` : 'Not Assigned',

      status: risk.status,

      priority: risk.priority,

      identifiedDate: risk.identified_date,

      nextReviewDate: risk.next_review_date,

      documentationStatus: risk.documentation_status,

      createdAt: risk.created_at

    };



    res.status(201).json(transformedRisk);

  } catch (error) {

    console.error('Risk creation error:', error);

    res.status(500).json({ error: 'Failed to create risk' });

  }

});



app.put('/api/risks/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const updateData = req.body;



    // Remove fields that shouldn't be updated

    delete updateData.id;

    delete updateData.createdAt;

    delete updateData.updatedAt;



    // Convert date strings to Date objects

    if (updateData.identifiedDate) {

      updateData.identifiedDate = new Date(updateData.identifiedDate);

    }

    if (updateData.nextReviewDate) {

      updateData.nextReviewDate = new Date(updateData.nextReviewDate);

    }



    const risk = await prisma.risks.update({

      where: { id: parseInt(id) },

      data: updateData,

      include: {

        risk_categories: true,

        departments: true,

        users_risks_risk_owner_idTousers: {

          select: {

            first_name: true,

            last_name: true

          }

        },

        users_risks_risk_manager_idTousers: {

          select: {

            first_name: true,

            last_name: true

          }

        }

      }

    });



    // Transform response

    const transformedRisk = {

      id: risk.id,

      code: risk.risk_code,

      title: risk.risk_title,

      description: risk.risk_description,

      whatCanHappen: risk.what_can_happen,

      category: risk.risk_categories?.category_name || 'Not Assigned',

      department: risk.departments?.department_name || 'Not Assigned',

      owner: risk.users_risks_risk_owner_idTousers ? `${risk.users_risks_risk_owner_idTousers.first_name} ${risk.users_risks_risk_owner_idTousers.last_name}` : 'Not Assigned',

      manager: risk.users_risks_risk_manager_idTousers ? `${risk.users_risks_risk_manager_idTousers.first_name} ${risk.users_risks_risk_manager_idTousers.last_name}` : 'Not Assigned',

      status: risk.status,

      priority: risk.priority,

      identifiedDate: risk.identified_date,

      nextReviewDate: risk.next_review_date,

      documentationStatus: risk.documentation_status,

      createdAt: risk.created_at,

      updatedAt: risk.updated_at

    };



    res.json(transformedRisk);

  } catch (error) {

    console.error('Risk update error:', error);

    res.status(500).json({ error: 'Failed to update risk' });

  }

});



app.delete('/api/risks/:id', async (req, res) => {

  try {

    const { id } = req.params;

    await prisma.risks.delete({

      where: { id: parseInt(id) }

    });

    res.json({ message: 'Risk deleted successfully' });

  } catch (error) {

    console.error('Risk deletion error:', error);

    res.status(500).json({ error: 'Failed to delete risk' });

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










