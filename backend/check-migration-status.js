const { Pool } = require('pg');

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

async function checkMigrationStatus() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking migration status...\n');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'roles', 'user_roles', 'projects', 'milestones', 'tasks', 'project_members', 'comments', 'attachments', 'time_logs')
      ORDER BY table_name
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('📋 Database Tables Status:');
    const expectedTables = ['users', 'roles', 'user_roles', 'projects', 'milestones', 'tasks', 'project_members', 'comments', 'attachments', 'time_logs'];
    
    expectedTables.forEach(table => {
      const status = existingTables.includes(table) ? '✅' : '❌';
      console.log(`   ${status} ${table}`);
    });
    
    // Check if superadmin user exists
    if (existingTables.includes('users')) {
      const userQuery = `
        SELECT username, email, is_active, created_at 
        FROM users 
        WHERE username = 'superadmin'
      `;
      
      const userResult = await client.query(userQuery);
      
      console.log('\n👤 Superadmin User Status:');
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        console.log(`   ✅ Username: ${user.username}`);
        console.log(`   ✅ Email: ${user.email}`);
        console.log(`   ✅ Active: ${user.is_active}`);
        console.log(`   ✅ Created: ${user.created_at}`);
      } else {
        console.log('   ❌ Superadmin user not found');
      }
    }
    
    // Check if roles exist
    if (existingTables.includes('roles')) {
      const rolesQuery = `
        SELECT name, description 
        FROM roles 
        ORDER BY name
      `;
      
      const rolesResult = await client.query(rolesQuery);
      
      console.log('\n🔐 Roles Status:');
      if (rolesResult.rows.length > 0) {
        rolesResult.rows.forEach(role => {
          console.log(`   ✅ ${role.name}: ${role.description}`);
        });
      } else {
        console.log('   ❌ No roles found');
      }
    }
    
    // Check if triggers exist
    const triggersQuery = `
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public' 
      AND trigger_name LIKE '%updated_at%'
      ORDER BY event_object_table
    `;
    
    const triggersResult = await client.query(triggersQuery);
    
    console.log('\n⚡ Triggers Status:');
    if (triggersResult.rows.length > 0) {
      triggersResult.rows.forEach(trigger => {
        console.log(`   ✅ ${trigger.trigger_name} on ${trigger.event_object_table}`);
      });
    } else {
      console.log('   ❌ No updated_at triggers found');
    }
    
    // Check if indexes exist
    const indexesQuery = `
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `;
    
    const indexesResult = await client.query(indexesQuery);
    
    console.log('\n📊 Indexes Status:');
    if (indexesResult.rows.length > 0) {
      indexesResult.rows.forEach(index => {
        console.log(`   ✅ ${index.indexname} on ${index.tablename}`);
      });
    } else {
      console.log('   ❌ No performance indexes found');
    }
    
    // Overall status
    console.log('\n🎯 Overall Migration Status:');
    const totalTables = expectedTables.length;
    const existingTableCount = existingTables.length;
    
    if (existingTableCount === totalTables) {
      console.log('   ✅ All tables exist - Migration appears complete');
    } else {
      console.log(`   ⚠️  ${existingTableCount}/${totalTables} tables exist - Migration may be incomplete`);
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (existingTableCount === 0) {
      console.log('   - Run: npm run migrate');
    } else if (existingTableCount < totalTables) {
      console.log('   - Run: npm run migrate (to complete missing tables)');
      console.log('   - Or run: npm run migrate:reset (for clean slate)');
    } else {
      console.log('   - Database is ready for use');
      console.log('   - Run: npm run migrate:down (if you need to reset)');
    }
    
  } catch (error) {
    console.error('❌ Error checking migration status:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if PostgreSQL is running');
    console.log('2. Verify database connection settings');
    console.log('3. Ensure database exists');
    console.log('4. Check user permissions');
  } finally {
    client.release();
    await pool.end();
  }
}

// Run status check if this script is executed directly
if (require.main === module) {
  checkMigrationStatus()
    .then(() => {
      console.log('\nMigration status check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration status check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkMigrationStatus }; 