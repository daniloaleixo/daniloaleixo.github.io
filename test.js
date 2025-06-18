import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000';

console.log('🧪 Running tests...');

async function runTests() {
    // Test 1: Check if server is running
    try {
        const response = await fetch(baseUrl);
        
        if (response.status === 200) {
            console.log('✅ Test 1 PASSED: Server is running and responding');
        } else {
            console.log('❌ Test 1 FAILED: Server returned status code', response.status);
        }
        
        // Test 2: Check if static files are served
        try {
            const staticResponse = await fetch(baseUrl + '/public/css/styles.css');
            
            if (staticResponse.status === 200) {
                console.log('✅ Test 2 PASSED: Static files are being served');
            } else {
                console.log('❌ Test 2 FAILED: Static files returned status code', staticResponse.status);
            }
        } catch (error) {
            console.log('❌ Test 2 FAILED: Static files not accessible');
            console.log('   Error:', error.message);
        }
        
        console.log('\n🎉 Tests completed!');
        console.log('📝 Note: Email functionality requires SENDGRID_API_KEY environment variable');
        
    } catch (error) {
        console.log('❌ Test 1 FAILED: Server is not running');
        console.log('   Error:', error.message);
        process.exit(1);
    }
}

runTests();
