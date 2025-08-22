// Simple test script to verify the Node.js backend
const API_BASE = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing Risk Management Backend...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    console.log('   Timestamp:', healthData.timestamp, '\n');

    // Test categories endpoint
    console.log('2. Testing categories endpoint...');
    const categoriesResponse = await fetch(`${API_BASE}/categories`);
    const categoriesData = await categoriesResponse.json();
    if (categoriesData.success) {
      console.log(`✅ Categories loaded: ${categoriesData.data.length} categories`);
      categoriesData.data.forEach(cat => {
        console.log(`   - ${cat.category_name}`);
      });
    } else {
      console.log('❌ Failed to load categories:', categoriesData.error);
    }
    console.log('');

    // Test departments endpoint
    console.log('3. Testing departments endpoint...');
    const departmentsResponse = await fetch(`${API_BASE}/departments`);
    const departmentsData = await departmentsResponse.json();
    if (departmentsData.success) {
      console.log(`✅ Departments loaded: ${departmentsData.data.length} departments`);
      departmentsData.data.forEach(dept => {
        console.log(`   - ${dept.department_name}`);
      });
    } else {
      console.log('❌ Failed to load departments:', departmentsData.error);
    }
    console.log('');

    // Test users endpoint
    console.log('4. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    if (usersData.success) {
      console.log(`✅ Users loaded: ${usersData.data.length} users`);
      usersData.data.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.employee_id})`);
      });
    } else {
      console.log('❌ Failed to load users:', usersData.error);
    }
    console.log('');

    // Test risks endpoint
    console.log('5. Testing risks endpoint...');
    const risksResponse = await fetch(`${API_BASE}/risks`);
    const risksData = await risksResponse.json();
    if (risksData.success) {
      console.log(`✅ Risks loaded: ${risksData.data.length} risks`);
      if (risksData.data.length > 0) {
        console.log('   Sample risk:', {
          id: risksData.data[0].id,
          title: risksData.data[0].title,
          status: risksData.data[0].status,
          riskLevel: risksData.data[0].riskLevel
        });
      }
    } else {
      console.log('❌ Failed to load risks:', risksData.error);
    }
    console.log('');

    console.log('🎉 Backend test completed successfully!');
    console.log('   Your Node.js API is working correctly.');
    console.log('   You can now use the frontend with the new backend.');

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting tips:');
    console.log('   1. Make sure your Node.js server is running (npm run server)');
    console.log('   2. Check that MySQL/XAMPP is running');
    console.log('   3. Verify the database connection in backend/server.js');
    console.log('   4. Check the console for any error messages');
  }
}

// Run the test
testBackend();
