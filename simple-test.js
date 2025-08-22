// Simple test - just check if server responds
console.log('🧪 Simple API Test...');

fetch('http://localhost:5000/api/health')
  .then(response => response.text())
  .then(data => {
    console.log('✅ Server responded!');
    console.log('Response:', data);
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
  });











