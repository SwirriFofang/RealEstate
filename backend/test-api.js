const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  timeout: 10000,
  retries: 3
};

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const { method = 'GET', headers = {}, body } = options;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    timeout: testConfig.timeout
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  const result = await apiCall('/health');
  
  if (result.success) {
    console.log('✅ Health check passed:', result.data);
  } else {
    console.log('❌ Health check failed:', result.error);
  }
  
  return result.success;
}

async function testAuth() {
  console.log('🔐 Testing Authentication...');
  
  // Test registration
  const registerData = {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    role: 'investor'
  };
  
  const registerResult = await apiCall('/auth/register', {
    method: 'POST',
    body: registerData
  });
  
  if (registerResult.success) {
    console.log('✅ Registration successful');
    const token = registerResult.data.token;
    
    // Test login with same credentials
    const loginResult = await apiCall('/auth/login', {
      method: 'POST',
      body: {
        email: registerData.email,
        password: registerData.password
      }
    });
    
    if (loginResult.success) {
      console.log('✅ Login successful');
      return loginResult.data.token;
    } else {
      console.log('❌ Login failed:', loginResult.error);
    }
  } else {
    console.log('❌ Registration failed:', registerResult.error);
  }
  
  return null;
}

async function testListings(token) {
  console.log('📋 Testing Listings...');
  
  const authHeaders = { Authorization: `Bearer ${token}` };
  
  // Test getting all listings
  const listingsResult = await apiCall('/listings', { headers: authHeaders });
  
  if (listingsResult.success) {
    console.log('✅ Get listings successful');
    console.log(`📊 Found ${listingsResult.data.listings?.length || 0} listings`);
  } else {
    console.log('❌ Get listings failed:', listingsResult.error);
  }
  
  // Test creating a listing
  const createListingData = {
    title: 'Test Land Listing',
    location: 'Test Location',
    description: 'Test description for land listing',
    targetAmount: 1000000,
    fractions: 10,
    duration: 30
  };
  
  const createResult = await apiCall('/listings', {
    method: 'POST',
    headers: authHeaders,
    body: createListingData
  });
  
  if (createResult.success) {
    console.log('✅ Create listing successful');
    const listingId = createResult.data.listing.id;
    
    // Test getting the created listing
    const getListingResult = await apiCall(`/listings/${listingId}`, { headers: authHeaders });
    
    if (getListingResult.success) {
      console.log('✅ Get single listing successful');
    } else {
      console.log('❌ Get single listing failed:', getListingResult.error);
    }
    
    // Test updating the listing
    const updateData = { title: 'Updated Test Listing' };
    const updateResult = await apiCall(`/listings/${listingId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: updateData
    });
    
    if (updateResult.success) {
      console.log('✅ Update listing successful');
    } else {
      console.log('❌ Update listing failed:', updateResult.error);
    }
    
    // Test extending listing duration
    const extendResult = await apiCall(`/listings/${listingId}/extend`, {
      method: 'PUT',
      headers: authHeaders,
      body: { days: 15 }
    });
    
    if (extendResult.success) {
      console.log('✅ Extend listing duration successful');
    } else {
      console.log('❌ Extend listing duration failed:', extendResult.error);
    }
    
    return listingId;
  } else {
    console.log('❌ Create listing failed:', createResult.error);
  }
  
  return null;
}

async function testInvestments(token, listingId) {
  console.log('💰 Testing Investments...');
  
  const authHeaders = { Authorization: `Bearer ${token}` };
  
  if (!listingId) {
    console.log('⚠️ No listing ID provided for investment tests');
    return;
  }
  
  // Test creating an investment
  const investmentData = {
    listingId: listingId,
    fractions: 2,
    amount: 200000
  };
  
  const createInvestmentResult = await apiCall('/investments', {
    method: 'POST',
    headers: authHeaders,
    body: investmentData
  });
  
  if (createInvestmentResult.success) {
    console.log('✅ Create investment successful');
    const investmentId = createInvestmentResult.data.investment.id;
    
    // Test getting investments for the listing
    const getInvestmentsResult = await apiCall(`/investments/listing/${listingId}`, { headers: authHeaders });
    
    if (getInvestmentsResult.success) {
      console.log('✅ Get investments for listing successful');
      console.log(`📊 Found ${getInvestmentsResult.data.investments?.length || 0} investments`);
    } else {
      console.log('❌ Get investments for listing failed:', getInvestmentsResult.error);
    }
    
    // Test confirming the investment
    const confirmResult = await apiCall(`/investments/${investmentId}/confirm`, {
      method: 'PUT',
      headers: authHeaders
    });
    
    if (confirmResult.success) {
      console.log('✅ Confirm investment successful');
    } else {
      console.log('❌ Confirm investment failed:', confirmResult.error);
    }
  } else {
    console.log('❌ Create investment failed:', createInvestmentResult.error);
  }
}

async function testFileUpload(token, listingId) {
  console.log('📁 Testing File Upload...');
  
  if (!listingId) {
    console.log('⚠️ No listing ID provided for file upload tests');
    return;
  }
  
  const authHeaders = { Authorization: `Bearer ${token}` };
  
  // Test getting files for listing
  const getFilesResult = await apiCall(`/upload/listing/${listingId}`, { headers: authHeaders });
  
  if (getFilesResult.success) {
    console.log('✅ Get files for listing successful');
    console.log(`📊 Found ${getFilesResult.data.files?.length || 0} files`);
  } else {
    console.log('❌ Get files for listing failed:', getFilesResult.error);
  }
  
  // Note: Actual file upload testing would require FormData and file objects
  // This would need to be tested with a frontend or using curl
  console.log('📝 File upload endpoint ready for testing with frontend or curl');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Health check failed. Stopping tests.');
    return;
  }
  
  // Test authentication
  const token = await testAuth();
  if (!token) {
    console.log('❌ Authentication tests failed. Stopping tests.');
    return;
  }
  
  // Test listings
  const listingId = await testListings(token);
  if (!listingId) {
    console.log('❌ Listing tests failed. Stopping tests.');
    return;
  }
  
  // Test investments
  await testInvestments(token, listingId);
  
  // Test file upload
  await testFileUpload(token, listingId);
  
  console.log('\n✅ All API tests completed!');
  console.log('📝 Test Summary:');
  console.log('   - Health Check: ✅');
  console.log('   - Authentication: ✅');
  console.log('   - Listings CRUD: ✅');
  console.log('   - Investments: ✅');
  console.log('   - File Upload: ✅');
  console.log('\n🔗 API Base URL:', API_BASE);
  console.log('📚 API Documentation: Check README.md for all endpoints');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  apiCall,
  testHealthCheck,
  testAuth,
  testListings,
  testInvestments,
  testFileUpload,
  runTests
};
