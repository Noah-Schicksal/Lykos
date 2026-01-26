import 'dotenv/config'; //carrega as variáveis de ambiente
import express from 'express';
import cookieParser from 'cookie-parser';
import { initializeDatabase } from './database/init';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

// Inicializa o banco antes de subir o servidor
initializeDatabase();

// Rotas
app.use(routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
