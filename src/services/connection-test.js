// Backend Connection Test
import apiService from './api.js';

export const testBackendConnection = async () => {
  try {
    console.log('🔧 Testing backend connection...');
    
    // Test health check
    const healthResponse = await apiService.healthCheck();
    console.log('✅ Backend health check:', healthResponse);
    
    // Test with sample login (using CSV data)
    try {
      const loginResponse = await apiService.login({
        email: 'investor@example.com',
        password: 'password123'
      });
      console.log('✅ Sample login successful:', loginResponse);
      
      // Test getting listings
      const listingsResponse = await apiService.getListings();
      console.log('✅ Listings API working:', listingsResponse);
      
      return { success: true, message: 'Backend connection successful!' };
    } catch (loginError) {
      console.log('⚠️ Sample login failed (expected if no data):', loginError.message);
      return { success: true, message: 'Backend connected, but no sample data yet' };
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { success: false, error: error.message };
  }
};

export default testBackendConnection;
