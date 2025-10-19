// TEST-UNSPLASH.js
// Temporary file to test your Unsplash API setup
// Run this in your browser console or create a test page

console.log('=== UNSPLASH API TEST ===');

// Test 1: Check if environment variable exists
const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
console.log('✅ Step 1: API Key loaded?', apiKey ? 'YES ✅' : 'NO ❌');
console.log('   First 10 characters:', apiKey?.substring(0, 10) || 'N/A');

// Test 2: Try a direct fetch to Unsplash
async function testUnsplashAPI() {
    if (!apiKey) {
        console.error('❌ Cannot test - API key not found!');
        console.log('💡 Fix: Add VITE_UNSPLASH_ACCESS_KEY to your .env file');
        console.log('💡 Then restart your dev server!');
        return;
    }

    console.log('✅ Step 2: Testing API request...');
    
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=coffee&page=1&per_page=1&client_id=${apiKey}`
        );
        
        console.log('   Response status:', response.status);
        
        if (response.status === 401) {
            console.error('❌ 401 Unauthorized - Your API key is invalid');
            console.log('💡 Fixes:');
            console.log('   1. Check you copied the ACCESS KEY (not secret key)');
            console.log('   2. Verify at: https://unsplash.com/oauth/applications');
            console.log('   3. Make sure your app is not deleted or suspended');
        } else if (response.status === 403) {
            console.error('❌ 403 Forbidden - Rate limit or app suspended');
        } else if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS! API is working');
            console.log('   Total results:', data.total);
            console.log('   First photo:', data.results[0]?.urls?.thumb);
            console.log('🎉 Your Unsplash integration is ready!');
        } else {
            console.error('❌ Unexpected error:', response.status);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

// Run the test
testUnsplashAPI();

// Test 3: Show all environment variables (for debugging)
console.log('\n=== ALL ENVIRONMENT VARIABLES ===');
console.log(import.meta.env);

/*
HOW TO USE THIS FILE:
1. Copy this entire code
2. Open your browser console (F12)
3. Paste and press Enter
4. Follow the instructions based on the output
*/