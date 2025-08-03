const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'project_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000
});

async function fixMissingColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing missing columns and tables...');
    
    // Read the fix SQL file
    const fixPath = path.join(__dirname, 'fix-missing-columns.sql');
    const fixSQL = fs.readFileSync(fixPath, 'utf8');
    
    console.log('📄 Executing missing columns migration...');
    
    // Execute the fix SQL
    await client.query(fixSQL);
    
    console.log('✅ Missing columns migration completed successfully!');
    console.log('🎯 Database schema is now complete with all required columns and tables.');
    
  } catch (error) {
    console.error('❌ Missing columns migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run fix if this script is executed directly
if (require.main === module) {
  fixMissingColumns()
    .then(() => {
      console.log('Missing columns fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Missing columns fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixMissingColumns }; 