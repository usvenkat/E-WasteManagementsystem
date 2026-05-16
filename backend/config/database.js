const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('\n=== MongoDB Atlas Connection Debug ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Attempting to connect to MongoDB Atlas...');
    
    // Log connection string (masked password)
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      const maskedUri = mongoUri.replace(/:[^:]+@/, ':****@');
      console.log('Connection String:', maskedUri);
    } else {
      console.error('ERROR: MONGODB_URI environment variable is not set!');
      console.error('Please check your .env file');
      process.exit(1);
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };

    let conn;
    try {
      conn = await mongoose.connect(process.env.MONGODB_URI, options);
    } catch (error) {
      const directUri = process.env.MONGODB_URI_DIRECT;
      const shouldFallback = directUri && (error.message.includes('querySrv ECONNREFUSED') || error.message.includes('getaddrinfo') || error.message.includes('Failed to parse'));
      if (shouldFallback) {
        console.warn('\n⚠️  SRV DNS lookup failed, retrying with direct MongoDB URI...');
        conn = await mongoose.connect(directUri, options);
      } else {
        throw error;
      }
    }

    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log('======================================\n');

    // Test the connection by checking collections
    testDatabaseConnection();

    return conn;
  } catch (error) {
    console.error('\n❌ Database Connection Error:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'EHOSTUNREACH') {
      console.error('⚠️  Connection Refused - MongoDB Atlas cluster may be paused or unreachable');
      console.error('   Solution: Resume your cluster in MongoDB Atlas dashboard');
    } else if (error.message.includes('authentication failed')) {
      console.error('⚠️  Authentication Failed - Invalid username or password');
      console.error('   Solution: Check credentials in .env file');
    } else if (error.message.includes('unauthorized')) {
      console.error('⚠️  Unauthorized - User may not have permissions');
      console.error('   Solution: Verify user role in MongoDB Atlas');
    }
    
    console.error('Full Error:', error);
    console.error('======================================\n');
    
    // Don't exit immediately - allow server to start for debugging
    console.warn('⚠️  Server will continue running without database connection');
    // Uncomment below to exit on connection failure
    // process.exit(1);
  }
};

// Test database connection
const testDatabaseConnection = async () => {
  try {
    console.log('\n🧪 Testing Database Connection...');
    
    // Test 1: List databases
    const admin = mongoose.connection.getClient().db().admin();
    const databases = await admin.listDatabases();
    console.log(`   Found ${databases.databases.length} database(s)`);
    
    // Test 2: Check if collections exist
    const db = mongoose.connection.getClient().db(process.env.MONGODB_URI?.split('/').pop().split('?')[0] || 'ewaste');
    const collections = await db.listCollections().toArray();
    console.log(`   Found ${collections.length} collection(s)`);
    collections.forEach(col => console.log(`     - ${col.name}`));
    
    console.log('✅ Database test completed successfully!\n');
  } catch (error) {
    console.error('⚠️  Database test failed:', error.message);
  }
};

module.exports = connectDB;
