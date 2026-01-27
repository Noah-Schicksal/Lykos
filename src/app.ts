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

const app = express();

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());

// Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use(routes);

// Error Handling
app.use(errorHandler);

export default app;
