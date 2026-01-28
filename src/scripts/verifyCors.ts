import request from 'supertest';

const BASE_URL = 'http://localhost:3333';

async function testCors() {
    console.log('Testing CORS Configuration...');

    // 1. Test Allowed Origin
    console.log('\n--- Test 1: Allowed Origin (http://localhost:3000) ---');
    let res = await request(BASE_URL)
        .get('/courses') // Public route
        .set('Origin', 'http://localhost:3000');

    if (res.status === 200 || res.status === 404) {
        const allowOrigin = res.headers['access-control-allow-origin'];
        if (allowOrigin === 'http://localhost:3000') {
            console.log('✅ Allowed origin request succeeded with correct header.');
        } else {
            console.error('⚠️ Request succeeded but missing/wrong Access-Control-Allow-Origin header:', allowOrigin);
        }
    } else {
        console.error('❌ Failed allowed origin request:', res.status, res.body);
    }

    // 2. Test Disallowed Origin
    console.log('\n--- Test 2: Disallowed Origin (http://evil.com) ---');
    res = await request(BASE_URL)
        .get('/courses')
        .set('Origin', 'http://evil.com');

    if (res.status === 500 && JSON.stringify(res.body).includes('Not allowed by CORS')) {
        console.log('✅ Disallowed origin blocked correctly (Error: Not allowed by CORS).');
    } else if (res.status === 403) {
        console.log('✅ Disallowed origin blocked (403).');
    } else {
        console.error('❌ Failed to block disallowed origin. Status:', res.status, 'Body:', res.body);
    }

    console.log('\n--- CORS Tests Completed ---');
}

testCors().catch(console.error);
