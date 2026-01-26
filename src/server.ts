import 'dotenv/config'; //carrega as variáveis de ambiente
import { validateEnv } from './config/env';

// Validate Env Vars immediately
validateEnv();

import express from 'express';
import cookieParser from 'cookie-parser';
import { initializeDatabase } from './database/init';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

import helmet from 'helmet';
import cors from 'cors';
import { globalLimiter } from './middlewares/rateLimitMiddleware';

const app = express();
const PORT = process.env.PORT;

const whitelist = process.env.CORS_ORIGIN_WHITELIST ? process.env.CORS_ORIGIN_WHITELIST.split(',') : [];

const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // !origin allows requests from non-browser sources (like Postman or server-to-server)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());

// Inicializa o banco antes de subir o servidor
initializeDatabase();

// Servir arquivos estáticos (removido /storage para acesso privado)
// app.use('/storage', express.static('storage'));

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
