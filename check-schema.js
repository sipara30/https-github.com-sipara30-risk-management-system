import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'risk_management'
};

async function checkSchema() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Check risks table structure
    console.log('\n🔍 Checking risks table structure...');
    const [riskColumns] = await connection.execute('DESCRIBE risks');
    console.log('Risks table columns:');
    riskColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Check sample data
    console.log('\n📊 Sample risks data:');
    const [risks] = await connection.execute('SELECT * FROM risks LIMIT 3');
    console.log(JSON.stringify(risks, null, 2));
    
    // Check other tables
    console.log('\n🔍 Checking other tables...');
    const tables = ['risk_categories', 'departments', 'users'];
    
    for (const table of tables) {
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      console.log(`\n${table} table columns:`);
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();







