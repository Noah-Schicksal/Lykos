import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
    'PORT',
    'JWT_SECRET',
    'DATABASE_PATH',
    'CORS_ORIGIN_WHITELIST'
];

export const validateEnv = (): void => {
    const missingVars: string[] = [];

    requiredEnvVars.forEach((key) => {
        if (!process.env[key]) {
            missingVars.push(key);
        }
    });

    if (missingVars.length > 0) {
        console.error('❌ Critical Error: Missing environment variables:');
        missingVars.forEach((key) => console.error(`   - ${key}`));
        console.error('Application will shut down.');
        process.exit(1);
    }

    console.log('✅ Environment check passed.');
};
