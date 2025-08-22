import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'risk_management'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Risk Management API is running',
    timestamp: new Date().toISOString()
  });
});

// User authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const connection = await pool.getConnection();
    
    // Get user with department and role information
    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.password_hash,
        u.first_name,
        u.last_name,
        u.email,
        u.employee_id,
        u.status,
        d.department_name,
        r.role_name,
        r.permissions
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE u.username = ? AND u.status = 'active'
    `;
    
    const [users] = await connection.execute(query, [username]);
    connection.release();
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = users[0];
    
    // Check if password hash exists (for demo purposes, accept any password)
    // In production, you should properly hash and verify passwords
    if (user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        username: user.username,
        role: user.role_name,
        permissions: user.permissions ? JSON.parse(user.permissions) : []
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.user_id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          employeeId: user.employee_id,
          department: user.department_name,
          role: user.role_name,
          permissions: user.permissions ? JSON.parse(user.permissions) : []
        }
      }
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// GET all risks
app.get('/api/risks', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const query = `
      SELECT 
        r.risk_id,
        r.risk_code,
        r.risk_title,
        r.risk_description,
        r.priority as risk_level,
        r.status,
        r.created_at,
        r.updated_at,
        rc.category_name,
        d.department_name,
        u.employee_id as owner_id,
        u.first_name,
        u.last_name
      FROM risks r
      LEFT JOIN risk_categories rc ON r.risk_category_id = rc.category_id
      LEFT JOIN departments d ON r.department_id = d.department_id
      LEFT JOIN users u ON r.risk_owner_id = u.user_id
      ORDER BY r.created_at DESC
    `;
    
    const [rows] = await connection.execute(query);
    connection.release();
    
    // Transform data to match frontend format
    const transformedRisks = rows.map(risk => ({
      id: risk.risk_id,
      title: risk.risk_title,
      description: risk.risk_description,
      riskLevel: risk.risk_level,
      status: risk.status,
      category: risk.category_name,
      project: risk.department_name || 'Not Assigned',
      owner: risk.first_name && risk.last_name ? `${risk.first_name} ${risk.last_name}` : 'Not Assigned',
      createdAt: risk.created_at,
      lastModifiedAt: risk.updated_at,
      lastModifiedBy: risk.first_name && risk.last_name ? `${risk.first_name} ${risk.last_name}` : 'Unknown'
    }));
    
    res.json({
      success: true,
      data: transformedRisks
    });
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risks'
    });
  }
});

// GET single risk by ID
app.get('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    const query = `
      SELECT 
        r.risk_id,
        r.risk_code,
        r.risk_title,
        r.risk_description,
        r.priority as risk_level,
        r.status,
        r.created_at,
        r.updated_at,
        rc.category_name,
        d.department_name,
        u.employee_id as owner_id,
        u.first_name,
        u.last_name
      FROM risks r
      LEFT JOIN risk_categories rc ON r.risk_category_id = rc.category_id
      LEFT JOIN departments d ON r.department_id = d.department_id
      LEFT JOIN users u ON r.risk_owner_id = u.user_id
      WHERE r.risk_id = ?
    `;
    
    const [rows] = await connection.execute(query, [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Risk not found'
      });
    }
    
    const risk = rows[0];
    const transformedRisk = {
      id: risk.risk_id,
      title: risk.risk_title,
      description: risk.risk_description,
      riskLevel: risk.risk_level,
      status: risk.status,
      category: risk.category_name,
      project: risk.department_name || 'Not Assigned',
      owner: risk.first_name && risk.last_name ? `${risk.first_name} ${risk.last_name}` : 'Not Assigned',
      createdAt: risk.created_at,
      lastModifiedAt: risk.updated_at,
      lastModifiedBy: risk.first_name && risk.last_name ? `${risk.first_name} ${risk.last_name}` : 'Unknown'
    };
    
    res.json({
      success: true,
      data: transformedRisk
    });
  } catch (error) {
    console.error('Error fetching risk:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risk'
    });
  }
});

// POST new risk
app.post('/api/risks', async (req, res) => {
  try {
    const { title, description, riskLevel, project, category, owner } = req.body;
    
    // Validate required fields
    if (!title || !description || !riskLevel || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, riskLevel, and category are required'
      });
    }
    
    const connection = await pool.getConnection();
    
    // Get category ID
    const [categoryResult] = await connection.execute(
      'SELECT category_id FROM risk_categories WHERE category_name = ?',
      [category]
    );
    
    if (categoryResult.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Invalid risk category'
      });
    }
    
    // Get department ID (optional)
    let departmentId = null;
    if (project && project !== 'Not Assigned') {
    const [deptResult] = await connection.execute(
      'SELECT department_id FROM departments WHERE department_name = ?',
      [project]
    );
    
    if (deptResult.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Invalid department'
      });
      }
      departmentId = deptResult[0].department_id;
    }
    
    // Get owner ID (optional)
    let ownerId = null;
    if (owner && owner !== 'Not Assigned') {
    const [ownerResult] = await connection.execute(
      'SELECT user_id FROM users WHERE CONCAT(first_name, " ", last_name) = ?',
      [owner]
    );
    
    if (ownerResult.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Invalid owner'
      });
      }
      ownerId = ownerResult[0].user_id;
    }
    
    // Get default risk register ID
    const [registerResult] = await connection.execute(
      'SELECT register_id FROM risk_registers LIMIT 1'
    );
    
    let registerId = 1; // Default fallback
    if (registerResult.length > 0) {
      registerId = registerResult[0].register_id;
    }
    
    // Generate risk code
    const riskCode = 'RISK' + new Date().getFullYear() + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    
    // Insert new risk
    const insertQuery = `
      INSERT INTO risks (
        risk_code, risk_title, risk_description, 
        priority, status, risk_register_id, risk_category_id, 
        department_id, risk_owner_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'Identified', ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await connection.execute(insertQuery, [
      riskCode,
      title,
      description,
      riskLevel,
      registerId,
      categoryResult[0].category_id,
      departmentId,
      ownerId
    ]);
    
    connection.release();
    
    res.status(201).json({
      success: true,
      message: 'Risk added successfully',
      data: {
        id: result.insertId,
      riskCode
      }
    });
    
  } catch (error) {
    console.error('Error adding risk:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add risk'
    });
  }
});

// PUT update risk
app.put('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, riskLevel, project, category, owner, status } = req.body;
    
    const connection = await pool.getConnection();
    
    // Check if risk exists
    const [existingRisk] = await connection.execute(
      'SELECT risk_id FROM risks WHERE risk_id = ?',
      [id]
    );
    
    if (existingRisk.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Risk not found'
      });
    }
    
    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];
    
    if (title) {
      updateFields.push('risk_title = ?');
      updateValues.push(title);
    }
    
    if (description) {
      updateFields.push('risk_description = ?');
      updateValues.push(description);
    }
    
    if (riskLevel) {
      updateFields.push('priority = ?');
      updateValues.push(riskLevel);
    }
    
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    if (category) {
      const [categoryResult] = await connection.execute(
        'SELECT category_id FROM risk_categories WHERE category_name = ?',
        [category]
      );
      
      if (categoryResult.length > 0) {
        updateFields.push('risk_category_id = ?');
        updateValues.push(categoryResult[0].category_id);
      }
    }
    
    if (project) {
      const [deptResult] = await connection.execute(
        'SELECT department_id FROM departments WHERE department_name = ?',
        [project]
      );
      
      if (deptResult.length > 0) {
        updateFields.push('department_id = ?');
        updateValues.push(deptResult[0].department_id);
      }
    }
    
    if (owner) {
      const [ownerResult] = await connection.execute(
        'SELECT user_id FROM users WHERE CONCAT(first_name, " ", last_name) = ?',
        [owner]
      );
      
      if (ownerResult.length > 0) {
        updateFields.push('risk_owner_id = ?');
        updateValues.push(ownerResult[0].user_id);
      }
    }
    
    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(id);
    
    const updateQuery = `UPDATE risks SET ${updateFields.join(', ')} WHERE risk_id = ?`;
    
    await connection.execute(updateQuery, updateValues);
    connection.release();
    
    res.json({
      success: true,
      message: 'Risk updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating risk:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update risk'
    });
  }
});

// DELETE risk
app.delete('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    // Check if risk exists
    const [existingRisk] = await connection.execute(
      'SELECT risk_id FROM risks WHERE risk_id = ?',
      [id]
    );
    
    if (existingRisk.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Risk not found'
      });
    }
    
    // Delete risk
    await connection.execute('DELETE FROM risks WHERE risk_id = ?', [id]);
    connection.release();
    
    res.json({
      success: true,
      message: 'Risk deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting risk:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete risk'
    });
  }
});

// GET risk categories
app.get('/api/categories', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute('SELECT * FROM risk_categories ORDER BY category_name');
    connection.release();
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// GET departments
app.get('/api/departments', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute('SELECT * FROM departments ORDER BY department_name');
    connection.release();
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments'
    });
  }
});

// GET users
app.get('/api/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute('SELECT user_id, first_name, last_name, email, employee_id FROM users WHERE status = "active" ORDER BY first_name, last_name');
    connection.release();
    
  res.json({
    success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/risks`);
  console.log(`   GET  /api/risks/:id`);
  console.log(`   POST /api/risks`);
  console.log(`   PUT  /api/risks/:id`);
  console.log(`   DELETE /api/risks/:id`);
  console.log(`   GET  /api/categories`);
  console.log(`   GET  /api/departments`);
  console.log(`   GET  /api/users`);
});
