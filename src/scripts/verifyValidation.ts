import request from 'supertest';

const BASE_URL = 'http://localhost:3333';

async function testValidation() {
    console.log('Testing Manual Input Validation...');

    console.log('\n--- Setup: Registering Instructor ---');
    const uniqueId = Date.now();
    const instructor = {
        name: `Inst ${uniqueId}`,
        email: `inst_${uniqueId}@test.com`,
        password: 'password123',
        role: 'INSTRUCTOR'
    };

    // Register
    await request(BASE_URL).post('/auth/register/instructor').send(instructor);

    // Login
    const loginRes = await request(BASE_URL)
        .post('/auth/login')
        .send({ email: instructor.email, password: instructor.password });

    // Log body to debug token structure if it fails
    if (!loginRes.body.data || !loginRes.body.data.token) {
        console.error('Login Failed Body:', loginRes.body);
    }

    const token = loginRes.body.data ? loginRes.body.data.token : loginRes.body.token;

    // 1. Test Register Validation (Bad Email)
    console.log('\n--- Test 1: Register with invalid email ---');
    let res = await request(BASE_URL)
        .post('/auth/register/student')
        .send({ name: 'Test User', email: 'not-an-email', password: 'password123' });

    if (res.status === 400 && JSON.stringify(res.body).includes('email')) {
        console.log('✅ Caught invalid email correctly.');
    } else {
        console.error('❌ Failed to catch invalid email:', res.status, res.body);
    }

    // 2. Test Register Validation (Short Password)
    console.log('\n--- Test 2: Register with short password ---');
    res = await request(BASE_URL)
        .post('/auth/register/student')
        .send({ name: 'Test User', email: 'valid@email.com', password: '123' });

    if (res.status === 400 && JSON.stringify(res.body).includes('password')) {
        console.log('✅ Caught short password correctly.');
    } else {
        console.error('❌ Failed to catch short password:', res.status, res.body);
    }

    // 3. Test Course Create Validation (Multipart - Missing Title)
    console.log('\n--- Test 3: Create Course - Missing Title (Multipart) ---');

    if (token) {
        res = await request(BASE_URL)
            .post('/courses')
            .set('Authorization', `Bearer ${token}`)
            // .field('title', '') // Missing title
            .field('description', 'Valid description here')
            .field('price', '99.99')
            .attach('coverImage', Buffer.from('fakeimage'), 'cover.jpg');

        if (res.status === 400 && JSON.stringify(res.body).includes('title')) {
            console.log('✅ Caught missing title in multipart request.');
        } else {
            console.error('❌ Failed to catch missing title:', res.status, res.body);
        }

        // 4. Test Course Create Validation (Multipart - Invalid Price)
        console.log('\n--- Test 4: Create Course - Invalid Price (Multipart) ---');
        res = await request(BASE_URL)
            .post('/courses')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Valid Course Title')
            .field('description', 'Valid description here')
            .field('price', 'not-a-number')
            .attach('coverImage', Buffer.from('fakeimage'), 'cover.jpg');

        if (res.status === 400 && JSON.stringify(res.body).includes('price')) {
            console.log('✅ Caught invalid price (detected non-number string).');
        } else {
            console.error('❌ Failed to catch invalid price:', res.status, res.body);
        }
    } else {
        console.error('Skipping authenticated tests due to login failure.');
    }

    console.log('\n--- Validation Tests Completed ---');
}

testValidation().catch(console.error);
