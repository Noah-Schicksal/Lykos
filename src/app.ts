import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimitMiddleware';
import { specs } from './config/swagger';
import { corsOptions } from './config/cors';

import path from 'path';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../dist/public')));

// Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use(routes);

// SPA Fallback
// const newLocal = app.get('*', (_req, res) => {
//     res.sendFile(path.join(__dirname, '../public/index.html'));
// });

// Error Handling
app.use(errorHandler);

export default app;
