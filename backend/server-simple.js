import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mock data for testing
const mockCategories = [
  { category_id: 1, category_name: 'Financial' },
  { category_id: 2, category_name: 'Security' },
  { category_id: 3, category_name: 'Operational' },
  { category_id: 4, category_name: 'Technical' }
];

const mockDepartments = [
  { department_id: 1, department_name: 'IT Department' },
  { department_id: 2, department_name: 'Finance' },
  { department_id: 3, department_name: 'Operations' },
  { department_id: 4, department_name: 'HR' }
];

const mockUsers = [
  { user_id: 1, first_name: 'John', last_name: 'Smith', employee_id: 'EMP001' },
  { user_id: 2, first_name: 'Sarah', last_name: 'Johnson', employee_id: 'EMP002' },
  { user_id: 3, first_name: 'Mike', last_name: 'Davis', employee_id: 'EMP003' }
];

const mockRisks = [
  {
    id: 1,
    title: 'Data Breach Risk',
    description: 'Potential security vulnerability in user authentication system',
    riskLevel: 'High',
    status: 'open',
    category: 'Security',
    project: 'IT Department',
    owner: 'John Smith',
    createdAt: '2024-01-15T10:00:00Z',
    lastModifiedAt: '2024-01-18T14:30:00Z',
    lastModifiedBy: 'John Smith'
  }
];

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Risk Management API is running (Mock Mode)',
    timestamp: new Date().toISOString(),
    note: 'Running with mock data - no database connection required'
  });
});

// Mock authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  // Mock successful login
  res.json({
    success: true,
    message: 'Login successful (Mock Mode)',
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        username: username,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        employeeId: 'EMP001',
        department: 'IT Department',
        role: 'Admin',
        permissions: ['read', 'write', 'delete']
      }
    }
  });
});

// GET all risks
app.get('/api/risks', async (req, res) => {
  res.json({
    success: true,
    data: mockRisks
  });
});

// GET single risk by ID
app.get('/api/risks/:id', async (req, res) => {
  const { id } = req.params;
  const risk = mockRisks.find(r => r.id == id);
  
  if (!risk) {
    return res.status(404).json({
      success: false,
      error: 'Risk not found'
    });
  }
  
  res.json({
    success: true,
    data: risk
  });
});

// POST new risk
app.post('/api/risks', async (req, res) => {
  const { title, description, riskLevel, project, category, owner } = req.body;
  
  if (!title || !description || !riskLevel || !project || !category || !owner) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  const newRisk = {
    id: mockRisks.length + 1,
    title,
    description,
    riskLevel,
    status: 'open',
    category,
    project,
    owner,
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: owner
  };
  
  mockRisks.push(newRisk);
  
  res.status(201).json({
    success: true,
    message: 'Risk added successfully (Mock Mode)',
    data: {
      id: newRisk.id,
      riskCode: 'RISK' + new Date().getFullYear() + String(newRisk.id).padStart(3, '0')
    }
  });
});

// PUT update risk
app.put('/api/risks/:id', async (req, res) => {
  const { id } = req.params;
  const riskIndex = mockRisks.findIndex(r => r.id == id);
  
  if (riskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Risk not found'
    });
  }
  
  const updatedRisk = { ...mockRisks[riskIndex], ...req.body, lastModifiedAt: new Date().toISOString() };
  mockRisks[riskIndex] = updatedRisk;
  
  res.json({
    success: true,
    message: 'Risk updated successfully (Mock Mode)'
  });
});

// DELETE risk
app.delete('/api/risks/:id', async (req, res) => {
  const { id } = req.params;
  const riskIndex = mockRisks.findIndex(r => r.id == id);
  
  if (riskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Risk not found'
    });
  }
  
  mockRisks.splice(riskIndex, 1);
  
  res.json({
    success: true,
    message: 'Risk deleted successfully (Mock Mode)'
  });
});

// GET risk categories
app.get('/api/categories', async (req, res) => {
  res.json({
    success: true,
    data: mockCategories
  });
});

// GET departments
app.get('/api/departments', async (req, res) => {
  res.json({
    success: true,
    data: mockDepartments
  });
});

// GET users
app.get('/api/users', async (req, res) => {
  res.json({
    success: true,
    data: mockUsers
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints (Mock Mode):`);
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
  console.log(`\n💡 This is a mock server for testing - no database required!`);
});
