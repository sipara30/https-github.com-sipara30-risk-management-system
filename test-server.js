import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Simple CORS setup
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Test risks endpoint
app.get('/api/risks', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Test Risk',
        description: 'This is a test risk',
        riskLevel: 'Medium',
        status: 'Identified',
        category: 'Technical',
        project: 'IT Department',
        owner: 'John Doe',
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: 'John Doe'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('📊 Test endpoints:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/risks');
});
