import { spawn, ChildProcess } from 'child_process';
import path from 'path';

const API_URL = 'http://localhost:3000'; // Adjust port if needed

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function isServerReady(): Promise<boolean> {
    try {
        // Try to fetch a known endpoint or just root if it exists
        // Since we don't know if root / exists, we can try to connect
        // Ideally we would have a health check, but we can try a harmless invalid route and check for 404 or connection refused
        await fetch(`${API_URL}/`);
        return true;
    } catch (error: any) {
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            return false;
        }
        // If we get response (even 404), server is up
        return true;
    }
}

async function runTests() {
    console.log('Starting Test Runner...');

    // 1. Start the Server
    const serverProcess: ChildProcess = spawn('npx', ['ts-node-dev', 'src/server.ts'], {
        cwd: process.cwd(),
        shell: true,
        stdio: 'inherit', // Let it log to console so we can see server output
        env: { ...process.env, PORT: '3000' }
    });

    try {
        console.log('Waiting for server to start...');
        let attempts = 0;
        while (attempts < 30) {
            if (await isServerReady()) {
                console.log('Server is ready!');
                break;
            }
            await sleep(1000);
            attempts++;
        }

        if (attempts >= 30) {
            throw new Error('Server failed to start within timeout.');
        }

        // 2. Run Tests
        console.log('\n--- Running Route Tests ---\n');

        // Test Data
        const student = {
            name: "Test Student",
            email: `student_${Date.now()}@test.com`,
            password: "Password123!",
            role: "student"
        };

        const instructor = {
            name: "Test Instructor",
            email: `instructor_${Date.now()}@test.com`,
            password: "Password123!",
            role: "instructor"
        };

        // TEST 1: Register Student
        console.log('TEST 1: Register Student');
        const resStudent = await fetch(`${API_URL}/auth/register/student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        const dataStudent = await resStudent.json();
        console.log('Status:', resStudent.status);
        console.log('Response:', dataStudent);
        if (resStudent.status === 201 || resStudent.status === 200) {
            console.log('✅ PASS');
        } else {
            console.error('❌ FAIL');
        }
        console.log('--------------------------------');

        // TEST 2: Register Instructor
        console.log('TEST 2: Register Instructor');
        const resInstructor = await fetch(`${API_URL}/auth/register/instructor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(instructor)
        });
        const dataInstructor = await resInstructor.json();
        console.log('Status:', resInstructor.status);
        console.log('Response:', dataInstructor);
        if (resInstructor.status === 201 || resInstructor.status === 200) {
            console.log('✅ PASS');
        } else {
            console.error('❌ FAIL');
        }
        console.log('--------------------------------');

        // TEST 3: Login Student
        console.log('TEST 3: Login Student');
        const resLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: student.email, password: student.password })
        });
        const dataLogin = await resLogin.json();
        console.log('Status:', resLogin.status);
        console.log('Response:', dataLogin);
        if (resLogin.status === 200 && dataLogin.token) {
            console.log('✅ PASS');
        } else {
            console.error('❌ FAIL');
        }
        console.log('--------------------------------');


    } catch (err) {
        console.error('Test Runner Error:', err);
    } finally {
        console.log('Stopping server...');
        serverProcess.kill();
        // On Windows, sometimes tree-kill might be needed for spawned processes via shell,
        // but try basic kill first.
        process.exit(0);
    }
}

runTests();
