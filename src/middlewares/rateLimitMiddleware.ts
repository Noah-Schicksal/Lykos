import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        status: 429,
        message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.'
    }
});

export const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // Limit each IP to 5 login requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Muitas tentativas de login, por favor tente novamente após 15 minutos.'
    }
});
