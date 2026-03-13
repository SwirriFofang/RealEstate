// Simple server test to verify backend is working
const { app } = require('./server.js');

// Test server startup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  
  // Test health check endpoint
  setTimeout(async () => {
    try {
      const fetch = require('node-fetch');
      const response = await fetch(`http://localhost:${PORT}/api/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Health check passed:', data);
        console.log('🎉 Server is working correctly!');
        process.exit(0);
      } else {
        console.log('❌ Health check failed:', data);
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Health check error:', error.message);
      process.exit(1);
    }
  }, 2000);
});

module.exports = { app };
