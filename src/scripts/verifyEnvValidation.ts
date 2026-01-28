import { spawn } from 'child_process';
import path from 'path';

const SCRIPT_PATH = path.resolve(__dirname, '../config/env.ts');
// We need a runner that just imports config/env.ts. 
// Since env.ts executes logic at top level (which is bad practice usually, but requested for fail-fast), 
// identifying it via ts-node might trigger it.
// Actually `env.ts` exports `validateEnv` and doesn't call it at top level (I changed that in my implementation).
// Good. `server.ts` calls it.

// So let's create a temporary test runner file.
import fs from 'fs';

const TEST_RUNNER_PATH = path.resolve(__dirname, 'temp_env_test_runner.ts');
const CODE = `
import { validateEnv } from '../config/env';
// Mock process.exit to avoid actually killing the test runner if we were running in-process, 
// but since we spawn a child, we want actual exit.
validateEnv();
`;

fs.writeFileSync(TEST_RUNNER_PATH, CODE);

async function runTest(envOverrides: NodeJS.ProcessEnv, description: string, expectedExitCode: number) {
    console.log(`\n--- Test: ${description} ---`);

    return new Promise<void>((resolve) => {
        const child = spawn('npx', ['ts-node', TEST_RUNNER_PATH], {
            env: { ...process.env, ...envOverrides }, // Inherit/Override
            cwd: process.cwd(),
            shell: true
        });

        let stderr = '';
        let stdout = '';

        child.stdout.on('data', (data) => stdout += data.toString());
        child.stderr.on('data', (data) => stderr += data.toString());

        child.on('close', (code) => {
            console.log(`Exit Code: ${code}`);
            if (stdout) console.log('Stdout:', stdout.trim());
            if (stderr) console.error('Stderr:', stderr.trim());

            if (code === expectedExitCode) {
                console.log('✅ Passed.');
            } else {
                console.error(`❌ Failed. Expected exit code ${expectedExitCode}, got ${code}`);
            }
            resolve();
        });
    });
}

async function verify() {
    // 1. Test with Missing Variables (Override one critical var to empty)
    await runTest({ 'JWT_SECRET': '' }, 'Missing JWT_SECRET', 1);

    // 2. Test with All Variables (Use current env which should be valid)
    // We assume the current environment where this script runs IS valid (npm run dev is running).
    // If local env is valid, this should pass.
    await runTest({}, 'Valid Environment', 0);

    // Cleanup
    if (fs.existsSync(TEST_RUNNER_PATH)) {
        fs.unlinkSync(TEST_RUNNER_PATH);
    }
}

verify().catch(console.error);
