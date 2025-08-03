const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function migrateDown() {
  const client = await pool.connect();
  
  try {
    console.log('⚠️  WARNING: This will delete ALL data and schema changes!');
    console.log('📋 This operation will:');
    console.log('   - Delete all tables (users, projects, tasks, time_logs, etc.)');
    console.log('   - Remove all indexes and triggers');
    console.log('   - Delete all data permanently');
    console.log('   - Reset database to initial state');
    console.log('');
    
    // Ask for confirmation
    const confirmation = await askQuestion('Are you sure you want to continue? (yes/no): ');
    
    if (confirmation.toLowerCase() !== 'yes') {
      console.log('❌ Migration down cancelled by user.');
      return;
    }
    
    // Double confirmation for production
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  PRODUCTION ENVIRONMENT DETECTED!');
      const doubleConfirm = await askQuestion('Type "DELETE ALL DATA" to confirm: ');
      
      if (doubleConfirm !== 'DELETE ALL DATA') {
        console.log('❌ Migration down cancelled - incorrect confirmation phrase.');
        return;
      }
    }
    
    console.log('🚀 Starting migration down...');
    
    // Read the migration down SQL file
    const migrationPath = path.join(__dirname, 'migrate-down.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing migration down...');
    
    // Execute the migration down SQL
    await client.query(migrationSQL);
    
    console.log('✅ Migration down completed successfully!');
    console.log('🗑️  All tables, indexes, triggers, and data have been removed.');
    console.log('🔄 Database has been reset to initial state.');
    
  } catch (error) {
    console.error('❌ Migration down failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
    rl.close();
  }
}

// Run migration down if this script is executed directly
if (require.main === module) {
  migrateDown()
    .then(() => {
      console.log('Migration down script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration down script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateDown }; 