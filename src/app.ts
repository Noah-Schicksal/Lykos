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
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
                imgSrc: [
                    "'self'",
                    'data:',
                    'https://lh3.googleusercontent.com',
                    'https://placehold.co',
                    'https://unpkg.com',
                ],
                fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://unpkg.com'],
                connectSrc: ["'self'"],
                frameSrc: ["'self'", 'https://www.youtube.com', 'https://youtube.com', 'https://player.vimeo.com', 'https://vimeo.com'],
                mediaSrc: ["'self'", 'data:', 'blob:'],
            },
        },
    }),
);
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use(routes);

// SPA Fallback
// app.get('*', (_req, res) => {
//     res.sendFile(path.join(__dirname, '../public/index.html'));
// });

// Error Handling
app.use(errorHandler);

export default app;
