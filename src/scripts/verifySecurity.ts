import request from 'supertest';

const BASE_URL = 'http://localhost:3333';

async function testRateLimit() {
    console.log('Testing Rate Limiting...');

    // 1. Test Login Rate Limit
    console.log('\n--- Testing Login Rate Limit (Limit: 5) ---');
    let blocked = false;
    for (let i = 1; i <= 10; i++) {
        const res = await request(BASE_URL)
            .post('/auth/login')
            .send({ email: `test${i}@example.com`, password: 'password' });

        console.log(`Attempt ${i}: Status ${res.status}`);

        if (res.status === 429) {
            console.log('✅ Rate limit hit as expected!');
            blocked = true;
            break;
        }
    }

    if (!blocked) {
        console.error('❌ Failed to trigger rate limit for login.');
    }

    // 2. Check Security Headers
    console.log('\n--- Checking Security Headers ---');
    const res = await request(BASE_URL)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

    const headers = res.headers;
    console.log('Headers received:', Object.keys(headers));

    if (headers['x-dns-prefetch-control'] || headers['x-frame-options']) {
        console.log('✅ Helmet headers detected (x-dns-prefetch-control or x-frame-options).');
    } else {
        console.warn('⚠️ Helmet headers might be missing.');
        console.log('All Headers:', headers);
    }
}

testRateLimit().catch(console.error);
