import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'risk_management'
};

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Existing tables:', tables.map(t => Object.values(t)[0]));
    
    if (tables.length === 0) {
      console.log('❌ No tables found! You need to run the setup_database.sql script.');
    } else {
      // Test each table
      const requiredTables = ['departments', 'roles', 'users', 'user_roles', 'risk_categories', 'risks'];
      
      for (const table of requiredTables) {
        try {
          const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`✅ Table ${table}: ${rows[0].count} rows`);
        } catch (error) {
          console.log(`❌ Table ${table}: Missing or error - ${error.message}`);
        }
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Solution: Create database "risk_management" first');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solution: Start XAMPP MySQL service');
    }
  }
}

testDatabase();







