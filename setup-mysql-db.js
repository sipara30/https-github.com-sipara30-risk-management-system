const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL (XAMPP default settings)
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306
    });

    console.log('✅ Connected to MySQL server');

    // Read the SQL setup file
    const sqlFile = path.join(__dirname, 'setup_database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL statements and execute them
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('ℹ️  Table already exists, skipping...');
          } else {
            console.log('⚠️  Warning:', error.message);
          }
        }
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('📊 Database: risk_management');
    console.log('🔗 You can now run: npx prisma generate');
    console.log('🚀 Then start your server: npm run server:prisma');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. XAMPP is running');
    console.log('   2. MySQL service is started');
    console.log('   3. MySQL is accessible on localhost:3306');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
