import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';

// Load environment variables: prefer OS env; fallback to backend/.env if missing
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

const app = express();
// Prisma client with connection management
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Only log errors and warnings
  log: ['warn', 'error'],
});

prisma.$on('error', (e) => {
  console.error('Prisma Error:', e);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

// Email transporter (lazy init)
const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP not fully configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS to enable email.');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies && req.cookies.token;
  const token = bearerToken || cookieToken;

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

// Enhanced role check middleware with permission checking
const roleCheck = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.roles) return res.status(403).json({ error: 'Forbidden' });
  const hasRole = req.user.roles.some(r => allowedRoles.includes(r));
  if (!hasRole) return res.status(403).json({ error: 'Insufficient role' });
  next();
};

// Permission check middleware for specific actions
const permissionCheck = (permission) => (req, res, next) => {
  if (!req.user || !req.user.permissions) return res.status(403).json({ error: 'Forbidden' });
  if (!req.user.permissions[permission]) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};

// Dashboard section access check middleware
const sectionAccessCheck = (sectionName) => (req, res, next) => {
  if (!req.user || !req.user.allowedSections) return res.status(403).json({ error: 'Forbidden' });
  if (!req.user.allowedSections.includes(sectionName)) return res.status(403).json({ error: 'Access denied to this section' });
  next();
};

// Verified and approved check middleware
const verifiedApprovedCheck = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.email_verified) return res.status(403).json({ error: 'Email not verified' });
    if (user.status !== 'approved') return res.status(403).json({ error: 'User not approved' });
    next();
  } catch (e) {
    return res.status(500).json({ error: 'Verification check failed' });
  }
};

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    uptime: process.uptime()
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

    // Check verification and approval
    if (!user.email_verified) return res.status(403).json({ error: 'Email not verified' });
    if (user.status !== 'approved') return res.status(403).json({ error: 'User not approved' });

    // Password check (replace with bcrypt in production)
    if (user.password_hash && password !== '12345678') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user's role and permissions
    const userRole = user.user_roles[0]?.roles;
    const roleName = userRole?.role_name || 'User';
    const permissions = userRole?.permissions || {};
    const allowedSections = user.allowed_dashboard_sections || userRole?.default_dashboard_sections || ['overview'];

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        roles: [roleName],
        permissions: permissions,
        allowedSections: allowedSections
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set httpOnly cookie for session-based auth
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 24 * 60 * 60 * 1000 });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        department: user.departments?.department_name || 'Not Assigned',
        roles: [roleName],
        permissions: permissions,
        allowedSections: allowedSections,
        assignedRole: user.assigned_role || roleName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Only check for the fields that are actually in the form
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'First name, last name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        email
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const generatedEmployeeId = `EMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Create new user (pending, not verified)
    const newUser = await prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        employee_id: generatedEmployeeId,
        department_id: null, // Will be assigned by admin later
        status: 'pending',
        username: email.split('@')[0],
        email_verified: false,
        verification_token: verificationToken
      }
    });

    // Assign default Staff role
    const staffRole = await prisma.roles.findFirst({
      where: { role_name: 'User' }
    });

    if (staffRole) {
      await prisma.user_roles.create({
        data: {
          user_id: newUser.id,
          role_id: staffRole.id
        }
      });
    }

    // Send verification email if SMTP configured
    try {
      const transporter = createTransporter();
      const verifyUrl = `${APP_URL}/verify-email/${verificationToken}`;
      await transporter.sendMail({
        from: SMTP_USER || 'no-reply@example.com',
        to: email,
        subject: 'Verify your email',
        html: `<p>Hello ${firstName},</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
      });
    } catch (e) {
      console.warn('Email sending failed (continuing):', e.message);
    }

    res.status(201).json({ 
      message: 'Registration successful. Check your email to verify. Await admin approval after verification.',
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

// Email verification endpoint
app.get('/api/auth/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await prisma.users.findFirst({ where: { verification_token: token } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });
    await prisma.users.update({
      where: { id: user.id },
      data: { email_verified: true, verification_token: null }
    });
    res.json({ message: 'Email verified successfully. Await admin approval.' });
  } catch (e) {
    console.error('Verify email error:', e);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Logout endpoint: clear cookie
app.get('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ message: 'Logged out' });
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

// Admin categories endpoint
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
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
    console.error('Admin categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch categories: ' + error.message });
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
        users_risks_submitted_byTousers: {
          select: {
            first_name: true,
            last_name: true
          }
        },
        users_risks_evaluated_byTousers: {
          select: {
            first_name: true,
            last_name: true
          }
        },
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
      risk_code: risk.risk_code,
      risk_title: risk.risk_title,
      risk_description: risk.risk_description,
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
      created_at: risk.created_at,
      updated_at: risk.updated_at,
      // Add the fields needed for CEO dashboard - keep original structure
      date_reported: risk.date_reported || risk.created_at,
      users_risks_submitted_byTousers: risk.users_risks_submitted_byTousers,
      users_risks_evaluated_byTousers: risk.users_risks_evaluated_byTousers,
      risk_categories: risk.risk_categories,
      departments: risk.departments,
      // Also add the transformed fields for compatibility
      submitted_by_name: risk.users_risks_submitted_byTousers ? 
        `${risk.users_risks_submitted_byTousers.first_name} ${risk.users_risks_submitted_byTousers.last_name}` : 'Unknown',
      evaluated_by_name: risk.users_risks_evaluated_byTousers ? 
        `${risk.users_risks_evaluated_byTousers.first_name} ${risk.users_risks_evaluated_byTousers.last_name}` : 'Not Evaluated'
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
    console.log('🔍 Backend received risk data:', req.body);
    
    const {
      title: riskTitle,
      description: riskDescription,
      category: riskCategory,
      department,
      likelihood,
      impact,
      urgencyLevel,
      priority,
      proposedMitigationActions,
      estimatedCost,
      estimatedTimeline,
      attachments,
      additionalNotes,
      date_reported,
      submitted_by,
      status,
      workflow_step,
      workflow_status
    } = req.body;

    console.log('🔍 Extracted fields:', {
      riskTitle,
      riskDescription,
      riskCategory,
      department
    });

    // Validation
    if (!riskTitle || !riskDescription || !riskCategory) {
      console.log('❌ Validation failed - missing fields:', {
        riskTitle: !!riskTitle,
        riskDescription: !!riskDescription,
        riskCategory: !!riskCategory
      });
      return res.status(400).json({ error: 'Risk title, description, and category are required' });
    }

    // Generate unique risk code
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const riskCode = `RISK-${timestamp}-${random}`;

    const risk = await prisma.risks.create({
      data: {
        risk_code: riskCode,
        risk_title: riskTitle,
        risk_description: riskDescription,
        risk_category_id: riskCategory ? parseInt(riskCategory) : null,
        department_id: department ? parseInt(department) : null,
        status: status || 'Submitted',
        priority: priority || 'Medium',
        date_reported: date_reported ? new Date(date_reported) : new Date(),
        submitted_by: submitted_by,
        workflow_step: workflow_step || 1,
        workflow_status: workflow_status || {
          step1_completed: true,
          step2_completed: false,
          step3_completed: false,
          step4_completed: false,
          step5_completed: false,
          step6_completed: false,
          last_updated: new Date().toISOString()
        },
        attachments: attachments || [],
        assessment_notes: additionalNotes
      },
      include: {
        risk_categories: true,
        departments: true,
        users_risks_submitted_byTousers: {
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
      risk_code: risk.risk_code,
      risk_title: risk.risk_title,
      risk_description: risk.risk_description,
      status: risk.status,
      workflow_step: risk.workflow_step,
      workflow_status: risk.workflow_status,
      department: risk.departments?.department_name || 'Not Assigned',
      category: risk.risk_categories?.category_name || 'Not Assigned',
      submitted_by: risk.users_risks_submitted_byTousers ? `${risk.users_risks_submitted_byTousers.first_name} ${risk.users_risks_submitted_byTousers.last_name}` : 'Not Assigned',
      date_reported: risk.date_reported,
      created_at: risk.created_at
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

// Workflow management endpoint
app.put('/api/risks/:id/workflow', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, workflow_step, workflow_status, updated_by_id } = req.body;

    console.log('🔄 Updating workflow for risk:', id, { status, workflow_step, workflow_status });

    const risk = await prisma.risks.update({
      where: { id: parseInt(id) },
      data: {
        status: status,
        workflow_step: workflow_step,
        workflow_status: workflow_status,
        updated_by_id: updated_by_id,
        updated_at: new Date()
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
        users_risks_submitted_byTousers: {
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
      risk_code: risk.risk_code,
      risk_title: risk.risk_title,
      risk_description: risk.risk_description,
      status: risk.status,
      workflow_step: risk.workflow_step,
      workflow_status: risk.workflow_status,
      department: risk.departments?.department_name || 'Not Assigned',
      category: risk.risk_categories?.category_name || 'Not Assigned',
      risk_owner: risk.users_risks_risk_owner_idTousers ? `${risk.users_risks_risk_owner_idTousers.first_name} ${risk.users_risks_risk_owner_idTousers.last_name}` : 'Not Assigned',
      submitted_by: risk.users_risks_submitted_byTousers ? `${risk.users_risks_submitted_byTousers.first_name} ${risk.users_risks_submitted_byTousers.last_name}` : 'Not Assigned',
      date_reported: risk.date_reported,
      created_at: risk.created_at,
      updated_at: risk.updated_at
    };

    console.log('✅ Workflow updated successfully for risk:', id);
    res.json(transformedRisk);
  } catch (error) {
    console.error('❌ Workflow update error:', error);
    res.status(500).json({ error: 'Failed to update workflow status' });
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
app.get('/api/admin/users', authenticateToken, roleCheck('Admin', 'SystemAdmin'), async (req, res) => {
  try {
    console.log('Fetching users...');
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
    if (error.code === 'P1017') {
      res.status(503).json({ error: 'Database connection lost. Please try again.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
    }
  }
});

app.get('/api/admin/roles', authenticateToken, roleCheck('Admin', 'SystemAdmin'), async (req, res) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json(roles);
  } catch (error) {
    console.error('Roles fetch error:', error);
    if (error.code === 'P1017') {
      res.status(503).json({ error: 'Database connection lost. Please try again.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch roles: ' + error.message });
    }
  }
});

app.get('/api/admin/departments', authenticateToken, roleCheck('Admin', 'SystemAdmin'), async (req, res) => {
  try {
    const departments = await prisma.departments.findMany();
    res.json(departments);
  } catch (error) {
    console.error('Departments fetch error:', error);
    if (error.code === 'P1017') {
      res.status(503).json({ error: 'Database connection lost. Please try again.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch departments: ' + error.message });
    }
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, roleCheck('Admin', 'SystemAdmin'), async (req, res) => {
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

app.put('/api/admin/users/:id/status', authenticateToken, roleCheck('Admin', 'SystemAdmin'), async (req, res) => {
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

// Dashboard sections endpoint
app.get('/api/admin/dashboard-sections', authenticateToken, roleCheck('Admin', 'SystemAdmin'), async (req, res) => {
  try {
    const sections = await prisma.dashboard_sections.findMany({
      where: { is_active: true },
      orderBy: { section_name: 'asc' }
    });
    res.json(sections);
  } catch (error) {
    console.error('Dashboard sections fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard sections: ' + error.message });
  }
});

// Enhanced approve user endpoint with role assignment and dashboard sections
app.post('/api/admin/approve-user', authenticateToken, roleCheck('Admin', 'SystemAdmin'), async (req, res) => {
  try {
    const { userId, roleId, allowedSections } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({ error: 'userId and roleId are required' });
    }

    // Get role information
    const role = await prisma.roles.findUnique({
      where: { id: parseInt(roleId) }
    });

    if (!role) {
      return res.status(400).json({ error: 'Invalid role ID' });
    }

    // Update user status and assign role
    const user = await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { 
        status: 'approved',
        assigned_role: role.role_name,
        allowed_dashboard_sections: allowedSections || role.default_dashboard_sections,
        permissions: role.permissions
      }
    });

    // Remove existing roles and assign new role
    await prisma.user_roles.deleteMany({ where: { user_id: user.id } });
    await prisma.user_roles.create({ 
      data: { 
        user_id: user.id, 
        role_id: parseInt(roleId) 
      } 
    });

    res.json({ 
      message: 'User approved and role assigned successfully',
      user: {
        id: user.id,
        email: user.email,
        assignedRole: role.role_name,
        allowedSections: allowedSections || role.default_dashboard_sections
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user: ' + error.message });
  }
});

// Get user's dashboard access
app.get('/api/user/dashboard-access', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = user.user_roles[0]?.roles;
    const allowedSections = user.allowed_dashboard_sections || userRole?.default_dashboard_sections || ['overview'];
    const permissions = user.permissions || userRole?.permissions || {};

    res.json({
      allowedSections,
      permissions,
      assignedRole: user.assigned_role || userRole?.role_name || 'User'
    });
  } catch (error) {
    console.error('Dashboard access fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard access: ' + error.message });
  }
});

// CEO Dashboard Endpoints
app.get('/api/ceo/overview', authenticateToken, async (req, res) => {
  try {
    // Check if user has CEO role
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user || user.user_roles[0]?.roles?.role_name !== 'CEO') {
      return res.status(403).json({ error: 'CEO access required' });
    }

    // Get overview statistics
    const totalUsers = await prisma.users.count();
    const pendingUsers = await prisma.users.count({ where: { status: 'pending' } });
    const approvedUsers = await prisma.users.count({ where: { status: 'approved' } });
    const totalDepartments = await prisma.departments.count();
    const totalRoles = await prisma.roles.count();

    // Get recent user registrations
    const recentUsers = await prisma.users.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
          select: {
        id: true,
            first_name: true,
        last_name: true,
        email: true,
        status: true,
        created_at: true
      }
    });

    res.json({
      statistics: {
        totalUsers,
        pendingUsers,
        approvedUsers,
        totalDepartments,
        totalRoles
      },
      recentUsers
    });
  } catch (error) {
    console.error('CEO overview fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch CEO overview: ' + error.message });
  }
});

app.get('/api/ceo/risk-management', authenticateToken, async (req, res) => {
  try {
    // Check if user has CEO role
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user || user.user_roles[0]?.roles?.role_name !== 'CEO') {
      return res.status(403).json({ error: 'CEO access required' });
    }

    // Get risk management data (placeholder for now)
    const riskData = {
      totalRisks: 0,
      highRisks: 0,
      mediumRisks: 0,
      lowRisks: 0,
      riskTrends: [
        { month: 'Jan', count: 5 },
        { month: 'Feb', count: 8 },
        { month: 'Mar', count: 12 },
        { month: 'Apr', count: 10 },
        { month: 'May', count: 15 },
        { month: 'Jun', count: 18 }
      ]
    };

    res.json(riskData);
  } catch (error) {
    console.error('CEO risk management fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch risk management data: ' + error.message });
  }
});

app.get('/api/ceo/reports', authenticateToken, async (req, res) => {
  try {
    // Check if user has CEO role
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user || user.user_roles[0]?.roles?.role_name !== 'CEO') {
      return res.status(403).json({ error: 'CEO access required' });
    }

    // Get reports data
    const reports = [
      {
        id: 1,
        title: 'Monthly User Activity Report',
        description: 'Comprehensive overview of user activities and system usage',
        type: 'monthly',
        lastGenerated: new Date().toISOString(),
        status: 'available'
      },
      {
        id: 2,
        title: 'Risk Assessment Summary',
        description: 'Quarterly risk assessment and mitigation status',
        type: 'quarterly',
        lastGenerated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available'
      },
      {
        id: 3,
        title: 'System Performance Report',
        description: 'System health and performance metrics',
        type: 'weekly',
        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available'
      }
    ];

    res.json({ reports });
  } catch (error) {
    console.error('CEO reports fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reports: ' + error.message });
  }
});

app.get('/api/ceo/system-health', authenticateToken, async (req, res) => {
  try {
    // Check if user has CEO role
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user || user.user_roles[0]?.roles?.role_name !== 'CEO') {
      return res.status(403).json({ error: 'CEO access required' });
    }

    // Get system health data
    const systemHealth = {
      status: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      databaseStatus: 'connected',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      activeConnections: Math.floor(Math.random() * 50) + 10,
      systemLoad: Math.random() * 0.8 + 0.2
    };

    res.json(systemHealth);
  } catch (error) {
    console.error('CEO system health fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch system health: ' + error.message });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

// User Risk Submission Endpoint
app.post('/api/user/submit-risk', authenticateToken, async (req, res) => {
  try {
    const { title, description, department, category, date_reported } = req.body;
    
    // Validate required fields
    if (!title || !description || !department || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new risk record
    const newRisk = await prisma.risks.create({
      data: {
        risk_code: `RISK-${Date.now()}`,
        risk_title: title,
        risk_description: description,
        department_id: parseInt(department),
        risk_category_id: parseInt(category),
        date_reported: new Date(date_reported),
        submitted_by: req.user.userId,
        status: 'Submitted',
        priority: 'Medium',
        identified_date: new Date(),
        created_by_id: req.user.userId,
        updated_by_id: req.user.userId
      }
    });

    res.json({ 
      message: 'Risk submitted successfully',
      risk: newRisk
    });
  } catch (error) {
    console.error('Risk submission error:', error);
    res.status(500).json({ error: 'Failed to submit risk: ' + error.message });
  }
});

// Get user's submitted risks
app.get('/api/user/risks', authenticateToken, async (req, res) => {
  try {
    const userRisks = await prisma.risks.findMany({
      where: { submitted_by: req.user.userId },
      include: {
        departments: true,
        risk_categories: true,
        users_risks_submitted_byTousers: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(userRisks);
  } catch (error) {
    console.error('User risks fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user risks: ' + error.message });
  }
});

// Risk Owner Endpoints
app.get('/api/risk-owner/risks', authenticateToken, async (req, res) => {
  try {
    // Check if user has RiskOwner role
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user || user.user_roles[0]?.roles?.role_name !== 'RiskOwner') {
      return res.status(403).json({ error: 'Risk Owner access required' });
    }

    const risks = await prisma.risks.findMany({
      include: {
        departments: true,
        risk_categories: true,
        users_risks_submitted_byTousers: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        },
        users_risks_risk_owner_idTousers: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(risks);
  } catch (error) {
    console.error('Risk owner risks fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch risks: ' + error.message });
  }
});

app.post('/api/risk-owner/evaluate/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { assessment_notes, severity, category_update, status_update } = req.body;
    
    // Check if user has RiskOwner role
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
      include: {
        user_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user || user.user_roles[0]?.roles?.role_name !== 'RiskOwner') {
      return res.status(403).json({ error: 'Risk Owner access required' });
    }

    // Validate required fields
    if (!assessment_notes || !severity || !status_update) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update risk with evaluation
    const updatedRisk = await prisma.risks.update({
      where: { id: parseInt(id) },
      data: {
        assessment_notes,
        severity,
        category_update: category_update || null,
        status_update,
        status: status_update,
        evaluated_by: req.user.userId,
        date_evaluated: new Date(),
        updated_by_id: req.user.userId,
        updated_at: new Date()
      }
    });

    res.json({ 
      message: 'Risk evaluation submitted successfully',
      risk: updatedRisk
    });
  } catch (error) {
    console.error('Risk evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate risk: ' + error.message });
  }
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
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










