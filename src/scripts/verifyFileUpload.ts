import request from 'supertest';

const BASE_URL = 'http://localhost:3333';

async function testFileUpload() {
    console.log('Testing File Upload Validation (Magic Numbers)...');

    // 1. Setup: Register & Login Instructor
    console.log('\n--- Setup: Registering Instructor ---');
    // Use highly unique email to avoid collision but consistent enough for debugging
    const uniqueId = `filetest_${Date.now()}`;
    const instructor = {
        name: `File Tester`,
        email: `${uniqueId}@test.com`,
        password: 'password123',
        role: 'INSTRUCTOR'
    };

    await request(BASE_URL).post('/auth/register/instructor').send(instructor);
    const loginRes = await request(BASE_URL).post('/auth/login').send({ email: instructor.email, password: instructor.password });

    if (loginRes.status !== 200) {
        console.error('Login failed. Status:', loginRes.status, 'Body:', loginRes.body);
    }

    const token = loginRes.body.data ? loginRes.body.data.token : loginRes.body.token;

    if (!token) {
        console.error('Failed to get token. Skipping tests.');
        return;
    }

    // 2. Test: Upload Valid PNG (Magic Numbers checks out)
    console.log('\n--- Test 1: Upload Valid PNG (Should Succeed) ---');
    // Create a minimal valid PNG buffer (Magic: 89 50 4E 47 0D 0A 1A 0A)
    const validPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    let res = await request(BASE_URL)
        .post('/courses')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Valid Image Course ' + uniqueId)
        .field('description', 'Course with valid image')
        .field('price', 10)
        .attach('coverImage', validPng, 'valid_image.png');

    if (res.status === 201) {
        console.log('✅ Valid PNG upload succeeded.');
    } else {
        console.error('❌ Valid PNG upload failed:', res.status, res.body);
    }

    // 3. Test: Upload Text renamed to PNG (Should Fail - No Magic Number, matches extension check failure)
    console.log('\n--- Test 2: Upload Text renamed to PNG (Should Fail) ---');
    const textFile = Buffer.from('This is just text code, not an image.');

    res = await request(BASE_URL)
        .post('/courses')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Fake Image Course')
        .field('description', 'Course with text as image')
        .field('price', 10)
        .attach('coverImage', textFile, 'fake_image.png');

    // Since it falls back to text check logic if undefined mime:
    // Text file usually has 'undefined' magic number.
    // Extension .png is passed.
    // .png is NOT in allowedTextExts.
    // So it throws "Unknown type or not allowed. Extension: .png"
    if (res.status === 400 && JSON.stringify(res.body).includes('Tipo de arquivo')) {
        console.log('✅ Text-as-PNG blocked correctly (Unknown type/Extension mismatch).');
    } else {
        console.error('❌ Text-as-PNG NOT blocked:', res.status, res.body);
    }

    // 4. Test: Upload Executable (Fake) renamed to JPG (Should Fail - Magic Number mismatch)
    console.log('\n--- Test 3: Upload EXE renamed to JPG (Should Fail) ---');
    // Minimal MZ header for EXE (4D 5A)
    const fakeExe = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

    res = await request(BASE_URL)
        .post('/courses')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Malware Course')
        .field('description', 'Course with malware')
        .field('price', 10)
        .attach('coverImage', fakeExe, 'innocent_photo.jpg');

    // file-type detects MZ as application/x-dosexec (usually)
    // Our allowlist only has images/videos
    if (res.status === 400 && JSON.stringify(res.body).includes('Tipo de arquivo')) {
        console.log('✅ EXE-as-JPG blocked correctly (Detected illegal mime).');
    } else {
        console.error('❌ EXE-as-JPG NOT blocked:', res.status, res.body);
    }

    console.log('\n--- File Validation Tests Completed ---');
}

testFileUpload().catch(console.error);
