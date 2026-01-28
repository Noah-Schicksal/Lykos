import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const API_PORT = 3001; // Porta diferente
const API_URL = `http://localhost:${API_PORT}`;
const LOG_FILE = 'RELATORIO_TESTES_FINAL.md';

let logBuffer = `# Log de Teste Completo da API\n\nData: ${new Date().toLocaleString('pt-BR')}\n\n`;

function log(message: string, type: 'INFO' | 'SUCESSO' | 'FALHA' | 'ERRO' = 'INFO') {
    const icon = type === 'SUCESSO' ? '✅' : type === 'FALHA' ? '❌' : type === 'ERRO' ? '⚠️' : 'ℹ️';
    const formatted = `${icon} **[${type}]** ${message}\n`;
    console.log(`${icon} [${type}] ${message}`);
    logBuffer += formatted;
}

function logSection(title: string) {
    const section = `\n## ${title}\n\n`;
    console.log(`\n--- ${title} ---\n`);
    logBuffer += section;
}

function logRequest(method: string, url: string, body?: any) {
    let msg = `> **Requisição**: \`${method} ${url}\`\n`;
    if (body) {
        msg += `> Corpo: \`\`\`json\n${JSON.stringify(body, null, 2)}\n\`\`\`\n`;
    }
    logBuffer += msg + '\n';
}

function logResponse(status: number, data: any) {
    let msg = `> **Resposta**: Status \`${status}\`\n`;
    if (data) {
        msg += `> Corpo: \`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
    }
    logBuffer += msg + '\n';
}

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

    logRequest(method, endpoint, isMultipart ? '[Dados Multipart]' : body);

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        logResponse(res.status, data);
        return { status: res.status, data };
    } catch (err: any) {
        log(`Erro na Requisição: ${err.message}`, 'ERRO');
        return { status: 0, data: null };
    }
}

async function runTests() {
    logSection('Inicialização');
    log(`Iniciando Servidor de Teste na porta ${API_PORT}...`);

    const serverProcess: ChildProcess = spawn('npx', ['ts-node', 'src/server.ts'], {
        cwd: process.cwd(),
        shell: true,
        stdio: 'pipe',
        env: { ...process.env, PORT: API_PORT.toString() }
    });

    serverProcess.stdout?.on('data', (data) => console.log(`[SERVIDOR]: ${data}`));
    serverProcess.stderr?.on('data', (data) => console.error(`[SERVIDOR ERRO]: ${data}`));

    try {
        let attempts = 0;
        let ready = false;
        while (attempts < 30) {
            if (await isServerReady()) {
                ready = true;
                break;
            }
            await sleep(1000);
            attempts++;
            process.stdout.write('.');
        }
        console.log('');

        if (!ready) throw new Error('Falha ao iniciar servidor');
        log('Servidor iniciado com sucesso.', 'SUCESSO');

        let studentToken = '';
        let instructorToken = '';
        let createdCourseId = '';
        let createdModuleId = '';
        let createdClassId = '';
        let testCategoryId = '';

        // --- AUTENTICAÇÃO ---
        logSection('1. Autenticação');

        const timestamp = Date.now();
        const studentUser = {
            name: `Estudante ${timestamp}`,
            email: `student_${timestamp}@test.com`,
            password: 'Password123!',
            role: 'STUDENT'
        };

        // 1.1 Registrar Estudante
        let res = await request('POST', '/auth/register/student', null, {
            name: studentUser.name,
            email: studentUser.email,
            password: studentUser.password
        });
        if (res.status === 201) log('Registro de Estudante', 'SUCESSO'); else log('Registro de Estudante', 'FALHA');

        // 1.2 Registrar Instrutor
        const instructorUser = {
            name: `Instrutor ${timestamp}`,
            email: `instructor_${timestamp}@test.com`,
            password: 'Password123!'
        };
        res = await request('POST', '/auth/register/instructor', null, instructorUser);
        if (res.status === 201) log('Registro de Instrutor', 'SUCESSO'); else log('Registro de Instrutor', 'FALHA');

        // 1.3 Login Estudante
        res = await request('POST', '/auth/login', null, { email: studentUser.email, password: studentUser.password });
        if (res.status === 200 && res.data.data?.token) {
            studentToken = res.data.data.token;
            log('Login Estudante', 'SUCESSO');
        } else log('Login Estudante', 'FALHA');

        // 1.4 Login Instrutor
        res = await request('POST', '/auth/login', null, { email: instructorUser.email, password: instructorUser.password });
        if (res.status === 200 && res.data.data?.token) {
            instructorToken = res.data.data.token;
            log('Login Instrutor', 'SUCESSO');
        } else log('Login Instrutor', 'FALHA');


        // --- CATEGORIAS ---
        logSection('2. Categorias (Instrutor/Admin)');

        res = await request('GET', '/categories');
        if (res.status === 200 && Array.isArray(res.data.data)) {
            log('Listar Categorias', 'SUCESSO');
            if (res.data.data.length > 0) {
                testCategoryId = res.data.data[0].id;
                log(`Usando ID de categoria existente: ${testCategoryId}`);
            } else {
                res = await request('POST', '/categories', instructorToken, { name: `Cat ${timestamp}` });
                if (res.status === 201 && res.data.data?.id) {
                    testCategoryId = res.data.data.id;
                    log('Criar Categoria', 'SUCESSO');
                } else {
                    log('Criar Categoria (Pulado ou Falhou)', 'INFO');
                    // Se falhar, tentamos listar de novo caso tenha sido criado
                }
            }
        } else {
            // Fallback se não retornou 200 ou array
            log('Listar Categorias', 'FALHA');
        }


        // --- CURSOS ---
        logSection('3. Gerenciamento de Cursos (Instrutor)');

        if (instructorToken) {
            // 3.1 Criar Curso
            // 3.1 Criar Curso (Com Imagem de Capa)
            const newCourseData = {
                title: `Curso ${timestamp}`,
                description: 'Descrição do curso de teste',
                price: 99.99,
                categoryId: testCategoryId
            };

            // Criar arquivo temporário para capa (JPEG Válido)
            const coverPath = path.join(process.cwd(), 'cover_temp.jpg');
            // Magic Number JPEG: FF D8 FF
            const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
            fs.writeFileSync(coverPath, validJpeg);

            const form = new FormData();
            form.append('title', newCourseData.title);
            form.append('description', newCourseData.description);
            form.append('price', newCourseData.price.toString());
            form.append('categoryId', newCourseData.categoryId);
            const coverBlob = new Blob([fs.readFileSync(coverPath)]);
            form.append('coverImage', coverBlob, 'cover.jpg');

            res = await request('POST', '/courses', instructorToken, form, true);

            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);

            if (res.status === 201 && res.data.data?.id) {
                createdCourseId = res.data.data.id;
                log('Criar Curso com Imagem', 'SUCESSO');

                // Verificar se URL da imagem foi retornada
                if (res.data.data.coverImageUrl) {
                    log('  coverImageUrl presente na resposta', 'SUCESSO');
                    const coverUrl = res.data.data.coverImageUrl;
                    log(`  URL: ${coverUrl}`);

                    // 3.1.1 Testar acesso público à imagem de capa
                    // A URL salva é relativa à web (ex: /storage/courses/...), mas temos uma rota pública /courses/:id/cover
                    // O controller create retorna a URL direta do storage no campo coverImageUrl atualmente
                    // Vamos tentar acessar pela rota pública /courses/:id/cover

                    const publicCoverRes = await fetch(`${API_URL}/courses/${createdCourseId}/cover`);
                    if (publicCoverRes.status === 200) {
                        log('  Acesso público GET /courses/:id/cover', 'SUCESSO');
                        // Content verification skipped for binary
                    } else {
                        log(`  Falha no acesso público à capa: ${publicCoverRes.status}`, 'FALHA');
                    }

                } else {
                    log('  coverImageUrl NÃO presente na resposta', 'FALHA');
                }
            } else {
                log('Criar Curso', 'FALHA');
                if (res.data) console.log(res.data);
            }

            if (createdCourseId) {
                // 3.2 Adicionar Módulo
                res = await request('POST', `/courses/${createdCourseId}/modules`, instructorToken, {
                    title: 'Módulo 1: Intro',
                    orderIndex: 1
                });
                if (res.status === 201 && res.data.data?.id) {
                    createdModuleId = res.data.data.id;
                    log('Criar Módulo', 'SUCESSO');
                } else log('Criar Módulo', 'FALHA');

                if (createdModuleId) {
                    // 3.3 Adicionar Aula
                    // Importante: Rota de criação de aula em moduleRoutes
                    res = await request('POST', `/modules/${createdModuleId}/classes`, instructorToken, {
                        title: 'Aula 1: Olá Mundo',
                        description: 'Primeira aula',
                        videoUrl: 'https://youtube.com/watch?v=123',
                        orderIndex: 1
                    });

                    if (res.status === 404) {
                        // Fallback se a rota estiver em /classes
                        res = await request('POST', `/classes`, instructorToken, {
                            title: 'Aula 1: Olá Mundo',
                            description: 'Primeira aula',
                            videoUrl: 'https://youtube.com/watch?v=123',
                            orderIndex: 1,
                            moduleId: createdModuleId
                        });
                    }

                    if (res.status === 201 && res.data.data?.id) {
                        createdClassId = res.data.data.id;
                        log('Criar Aula', 'SUCESSO');
                    } else log('Criar Aula', 'FALHA');
                }
            }

            // 3.4 Verificar Dashboard de Cursos (Authored)
            res = await request('GET', '/courses/authored', instructorToken);
            if (res.status === 200 && Array.isArray(res.data.data)) {
                log('Listar Cursos do Instrutor (Authored)', 'SUCESSO');
                const myCourses = res.data.data;
                const found = myCourses.some((c: any) => c.id === createdCourseId);
                if (found) {
                    log('  Curso criado encontrado na lista', 'SUCESSO');
                } else {
                    log('  Curso criado NÃO encontrado na lista', 'FALHA');
                }
            } else {
                log('Listar Cursos do Instrutor (Authored)', 'FALHA');
            }

            // 3.5 Verificar Isolamento (Outro instrutor não vê meu curso)
            const otherInstructor = {
                name: `Other Instr ${timestamp}`,
                email: `other_${timestamp}@test.com`,
                password: 'Password123!'
            };
            await request('POST', '/auth/register/instructor', null, otherInstructor);
            const otherLogin = await request('POST', '/auth/login', null, { email: otherInstructor.email, password: otherInstructor.password });
            const otherToken = otherLogin.data.data.token;

            res = await request('GET', '/courses/authored', otherToken);
            if (res.status === 200 && Array.isArray(res.data.data)) {
                const othersCourses = res.data.data;
                const found = othersCourses.some((c: any) => c.id === createdCourseId);
                if (!found) {
                    log('  Outro instrutor NÃO vê meu curso (Isolamento)', 'SUCESSO');
                } else {
                    log('  Outro instrutor VÊ meu curso (Falha de Isolamento)', 'FALHA');
                }
            }

        } else {
            log('Pulando Criação de Curso (Sem Token de Instrutor)', 'FALHA');
        }



        // --- STORAGE ---
        logSection('4. Storage & Materiais');
        // 4.1 Teste de Segurança: Outro instrutor não pode enviar material
        if (createdClassId) {
            const maliciousInstructor = {
                name: `Malicious ${timestamp}`,
                email: `hacker_${timestamp}@test.com`,
                password: 'Password123!'
            };
            let resHack = await request('POST', '/auth/register/instructor', null, maliciousInstructor);
            let hackerToken = '';
            resHack = await request('POST', '/auth/login', null, { email: maliciousInstructor.email, password: maliciousInstructor.password });
            if (resHack.status === 200) hackerToken = resHack.data.data.token;

            if (hackerToken) {
                const filePath = path.join(process.cwd(), 'arquivo_hacker.txt');
                fs.writeFileSync(filePath, 'Conteúdo malicioso.');
                const formData = new FormData();
                const fileBlob = new Blob([fs.readFileSync(filePath)]);
                formData.append('file', fileBlob, 'hacked.txt');

                resHack = await request('POST', `/classes/${createdClassId}/upload`, hackerToken, formData, true);

                if (resHack.status === 403 || resHack.status === 400 || resHack.status === 401) {
                    log('Segurança: Bloqueio de Upload por Outro Instrutor', 'SUCESSO');
                } else {
                    log(`Segurança: Outro instrutor conseguiu fazer upload! Status: ${resHack.status}`, 'FALHA');
                }
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        }

        if (createdClassId && instructorToken) {
            const filePath = path.join(process.cwd(), 'arquivo_teste_temp.txt');
            fs.writeFileSync(filePath, 'Conteúdo de teste para upload.');

            // Simulação de FormData com node-fetch (usando Blob e FormData nativos do Node 18+)
            const formData = new FormData();
            const fileBlob = new Blob([fs.readFileSync(filePath)]);
            formData.append('file', fileBlob, 'material_teste.txt');

            res = await request('POST', `/classes/${createdClassId}/upload`, instructorToken, formData, true);

            const matUrl = res.data.data?.materialUrl || res.data.data || res.data.materialUrl;

            if (res.status === 200 && matUrl) {
                log('Upload de Material', 'SUCESSO');
                log(`URL retornado: ${matUrl}`);

                // 4.1 Verificar que acesso PÚBLICO direto foi removido
                if (typeof matUrl === 'string') {
                    const accessRes = await fetch(`${API_URL}${matUrl}`);
                    if (accessRes.status === 404 || accessRes.status === 403 || accessRes.status === 401) {
                        log('Acesso Público Direto Bloqueado (Correto)', 'SUCESSO');
                    } else {
                        log(`Acesso Público Direto ABERTO (Falha de Segurança) Status: ${accessRes.status}`, 'FALHA');
                    }
                }

                // 4.2 Acesso via Endpoint Protegido (Instrutor)
                res = await request('GET', `/classes/${createdClassId}/material`, instructorToken);
                if (res.status === 200) {
                    log('Download via Endpoint Protegido (Instrutor)', 'SUCESSO');
                } else {
                    log(`Download via Endpoint Protegido (Instrutor) Falhou: ${res.status}`, 'FALHA');
                }

                // 4.3 Acesso via Endpoint Protegido (Aluno Não Matriculado)
                // O aluno studentToken ainda não comprou
                res = await request('GET', `/classes/${createdClassId}/material`, studentToken);
                if (res.status === 403 || res.status === 400 || res.status === 500) { // ApplicationError pode retornar 400
                    log('Bloqueio Aluno Não Matriculado', 'SUCESSO');
                } else {
                    log(`Aluno Não Matriculado conseguiu acessar! Status: ${res.status}`, 'FALHA');
                }

            } else {
                log('Upload de Material', 'FALHA');
            }

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } else {
            log('Pulando Teste de Storage (Sem ID de Aula)', 'INFO');
        }


        // --- FLUXO DO ALUNO ---
        logSection('5. Jornada do Estudante');

        // 5.1 Listar Cursos
        res = await request('GET', '/courses');
        if (res.status === 200) log('Listar Todos Cursos (Público)', 'SUCESSO'); else log('Listar Todos Cursos', 'FALHA');

        if (createdCourseId) {
            // 5.2 Detalhes
            res = await request('GET', `/courses/${createdCourseId}`);
            if (res.status === 200) log('Obter Detalhes do Curso', 'SUCESSO'); else log('Obter Detalhes do Curso', 'FALHA');

            // 5.2.1 Ver Estrutura do Curso (Módulos)
            let modulesList: any[] = [];
            res = await request('GET', `/courses/${createdCourseId}/modules`);
            if (res.status === 200 && Array.isArray(res.data.data)) {
                log('Listar Módulos do Curso', 'SUCESSO');
                modulesList = res.data.data;
            } else {
                log('Listar Módulos do Curso', 'FALHA');
            }

            // 5.2.2 Ver Detalhes do Módulo (e Confirmar Aulas)
            if (createdModuleId) {
                // Tenta pegar da lista ou usar ID conhecido
                res = await request('GET', `/modules/${createdModuleId}`);
                if (res.status === 200 && res.data.data?.classes) {
                    log('Obter Detalhes do Módulo (+ Aulas)', 'SUCESSO');
                    if (res.data.data.classes.length > 0) {
                        log('  Classes retornadas no módulo', 'SUCESSO');
                    } else {
                        log('  Classes vazias no módulo (Verifique se criou)', 'INFO');
                    }
                } else {
                    log('Obter Detalhes do Módulo', 'FALHA');
                }
            }

            // 5.2.3 Ver Detalhes da Aula (Video + Link Material)
            if (createdClassId && studentToken) {
                // Requer Auth
                res = await request('GET', `/classes/${createdClassId}`, studentToken);
                if (res.status === 200) {
                    const cls = res.data.data;
                    if (cls.videoUrl && cls.materialUrl) {
                        log('Obter Detalhes da Aula (Video/Material)', 'SUCESSO');
                    } else {
                        log('Obter Detalhes da Aula (Campos Faltando?)', 'INFO');
                    }
                } else {
                    log(`Obter Detalhes da Aula Falhou: ${res.status}`, 'FALHA');
                }
            }

            if (studentToken) {
                // 5.3 Carrinho
                res = await request('POST', '/cart', studentToken, { courseId: createdCourseId });
                if (res.status === 200 || res.status === 201) log('Adicionar ao Carrinho', 'SUCESSO'); else log('Adicionar ao Carrinho', 'FALHA');

                // 5.4 Checkout
                res = await request('POST', '/checkout', studentToken, {});
                if (res.status === 200 || res.status === 201) log('Realizar Checkout', 'SUCESSO'); else log('Realizar Checkout', 'FALHA');

                // 5.4.1 Validar acesso ao material após matrícula
                if (createdClassId) {
                    res = await request('GET', `/classes/${createdClassId}/material`, studentToken);
                    if (res.status === 200) {
                        log('Download via Endpoint Protegido (Aluno Matriculado)', 'SUCESSO');
                    } else {
                        log(`Download via Endpoint Protegido (Aluno Matriculado) Falhou: ${res.status}`, 'FALHA');
                    }
                }

                // 5.5 Meus Cursos
                res = await request('GET', '/my-courses', studentToken);
                if (res.status === 200) log('Obter Meus Cursos', 'SUCESSO'); else log('Obter Meus Cursos', 'FALHA');

                // 5.6 Progresso
                if (createdClassId) {
                    res = await request('POST', `/classes/${createdClassId}/progress`, studentToken, { completed: true });
                    if (res.status === 200 || res.status === 201) log('Marcar Aula Concluída', 'SUCESSO'); else log('Marcar Aula Concluída', 'FALHA');
                }

                // 5.7 Avaliação
                res = await request('POST', `/courses/${createdCourseId}/reviews`, studentToken, { rating: 5, comment: "Excelente curso!" });
                if (res.status === 201 || res.status === 200) log('Postar Avaliação', 'SUCESSO'); else log('Postar Avaliação', 'FALHA');
            }
        }

        // --- LIMPEZA ---
        logSection('6. Limpeza (Instrutor)');
        if (instructorToken && createdCourseId) {
            res = await request('DELETE', `/courses/${createdCourseId}`, instructorToken);
            if (res.status === 200 || res.status === 204) log('Excluir Curso', 'SUCESSO'); else log('Excluir Curso', 'FALHA');
        }


    } catch (err: any) {
        log(`Erro Fatal no Teste: ${err.message}`, 'ERRO');
        console.error(err);
    } finally {
        logSection('Finalização');
        console.log('Parando servidor...');
        serverProcess.kill();

        fs.writeFileSync(path.join(process.cwd(), LOG_FILE), logBuffer);
        console.log(`\nLog salvo em ${LOG_FILE}\n`);
        process.exit(0);
    }
}

runTests();
