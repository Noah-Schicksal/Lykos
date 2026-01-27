import 'dotenv/config';
import { validateEnv } from './config/env';
import { initializeDatabase } from './database/init';
import app from './app';

// Validate Env Vars immediately
validateEnv();

const PORT = process.env.PORT || 3000;

// Inicializa o banco antes de subir o servidor
initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
