
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const API_PORT = 3002; // Porta diferente para nao conflitar
const API_URL = `http://localhost:${API_PORT}`;

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function isServerReady(): Promise<boolean> {
    try {
        await fetch(`${API_URL}/`);
        return true;
    } catch (error: any) {
        if (error.cause && error.cause.code === 'ECONNREFUSED') return false;
        return true;
    }
}

async function request(method: string, endpoint: string, token: string | null = null, body: any = null, isMultipart = false): Promise<{ status: number, data: any }> {
    const headers: any = {};
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
        method,
        headers,
    };

    if (body) {
        if (isMultipart) {
            options.body = body;
            delete headers['Content-Type'];
        } else {
            options.body = JSON.stringify(body);
        }
    }

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
        return { status: res.status, data };
    } catch (err: any) {
        return { status: 0, data: null };
    }
}

function printTree(dir: string, prefix = '') {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach((file, index) => {
        const isLast = index === files.length - 1;
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const marker = isLast ? '└── ' : '├── ';
        console.log(`${prefix}${marker}${file}`);

        if (stats.isDirectory()) {
            printTree(filePath, prefix + (isLast ? '    ' : '│   '));
        }
    });
}

async function run() {
    console.log('--- Verificação de Estrutura do Storage ---');
    console.log(`Iniciando servidor on port ${API_PORT}...`);

    const serverProcess: ChildProcess = spawn('npx', ['ts-node', 'src/server.ts'], {
        cwd: process.cwd(),
        shell: true,
        stdio: 'pipe',
        env: { ...process.env, PORT: API_PORT.toString() }
    });

    try {
        let attempts = 0;
        while (attempts < 30) {
            if (await isServerReady()) break;
            await sleep(1000);
            attempts++;
        }

        console.log('Servidor ONLINE.');

        // 1. Registrar Instrutor
        const instructor = {
            name: `Instrutor Storage ${Date.now()}`,
            email: `storage_${Date.now()}@test.com`,
            password: 'Password123!'
        };
        await request('POST', '/auth/register/instructor', null, instructor);
        const loginRes = await request('POST', '/auth/login', null, { email: instructor.email, password: instructor.password });
        const token = loginRes.data.data.token;
        console.log('Instrutor logado.');

        // 2. Criar Categoria
        let catId = '';
        const listCat = await request('GET', '/categories');
        if (listCat.data.data.length > 0) {
            catId = listCat.data.data[0].id;
        } else {
            const catRes = await request('POST', '/categories', token, { name: 'Storage Test Cat' });
            catId = catRes.data.data.id;
        }

        // 3. Criar Curso
        console.log('Criando Curso...');
        const courseRes = await request('POST', '/courses', token, {
            title: 'Curso Storage Test',
            description: 'Testando estrutura de pastas',
            price: 10,
            categoryId: catId
        });
        const courseId = courseRes.data.data.id;

        // 4. Criar Módulo
        console.log('Criando Módulo...');
        const moduleRes = await request('POST', `/courses/${courseId}/modules`, token, {
            title: 'Módulo Único',
            orderIndex: 1
        });
        const moduleId = moduleRes.data.data.id;

        // 5. Criar Aulas
        console.log('Criando 2 Aulas...');

        // Aula 1
        const class1Res = await request('POST', `/modules/${moduleId}/classes`, token, {
            title: 'Aula Um',
            description: 'Desc 1',
            videoUrl: 'http://video1.com',
            orderIndex: 1
        });
        const class1Id = class1Res.data.data.id;

        // Aula 2
        const class2Res = await request('POST', `/modules/${moduleId}/classes`, token, {
            title: 'Aula Dois',
            description: 'Desc 2',
            videoUrl: 'http://video2.com',
            orderIndex: 2
        });
        const class2Id = class2Res.data.data.id;

        // 6. Upload Materiais
        console.log('Fazendo Upload de Materiais...');

        // Material 1
        const file1Path = 'temp_mat1.txt';
        fs.writeFileSync(file1Path, 'Material da Aula 1');
        const formData1 = new FormData();
        formData1.append('file', new Blob([fs.readFileSync(file1Path)]), 'material_aula_1.txt');
        await request('POST', `/classes/${class1Id}/upload`, token, formData1, true);
        fs.unlinkSync(file1Path);

        // Material 2
        const file2Path = 'temp_mat2.pdf';
        fs.writeFileSync(file2Path, 'Simulando um PDF');
        const formData2 = new FormData();
        formData2.append('file', new Blob([fs.readFileSync(file2Path)]), 'slides_aula_2.pdf');
        await request('POST', `/classes/${class2Id}/upload`, token, formData2, true);
        fs.unlinkSync(file2Path);

        console.log('\n--- ESTRUTURA FÍSICA NO DISCO ---');
        console.log('storage/courses/');
        printTree(path.join(process.cwd(), 'storage', 'courses'));

    } catch (err) {
        console.error(err);
    } finally {
        serverProcess.kill();
        process.exit(0);
    }
}

run();
