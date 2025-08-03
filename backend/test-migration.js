const { runMigrations } = require('./deploy-setup');

async function testMigration() {
  try {
    console.log('🧪 Testing migration script locally...');
    console.log('Make sure your local database is running and accessible.');
    console.log('Environment variables should be set for local database connection.\n');
    
    await runMigrations();
    
    console.log('\n✅ Migration test completed successfully!');
    console.log('🎯 Ready for Railway deployment.');
    
  } catch (error) {
    console.error('\n❌ Migration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if PostgreSQL is running locally');
    console.log('2. Verify database connection settings');
    console.log('3. Ensure database exists');
    console.log('4. Check user permissions');
    
    process.exit(1);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testMigration();
} 