const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from environment variables (Railway will provide these)
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

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Railway deployment setup...');
    
    // Step 1: Read and execute the main migration SQL file
    console.log('📄 Step 1: Executing main database migrations...');
    const migrationPath = path.join(__dirname, 'railway-setup.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSQL);
    console.log('✅ Main database migrations completed successfully!');
    
    // Step 2: Read and execute the fix-missing-columns migration
    console.log('📄 Step 2: Executing missing columns migration...');
    const fixPath = path.join(__dirname, 'fix-missing-columns.sql');
    const fixSQL = fs.readFileSync(fixPath, 'utf8');
    await client.query(fixSQL);
    console.log('✅ Missing columns migration completed successfully!');
    
    console.log('🎉 Railway deployment setup completed!');
    console.log('📋 Superadmin credentials:');
    console.log('   Username: superadmin');
    console.log('   Password: admin@123');
    console.log('🎯 Database schema is now complete with all required columns and tables.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this script is executed directly (standalone)
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration script completed successfully');
      // Only exit if this script is run directly (not imported)
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations }; 