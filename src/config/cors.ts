import cors from 'cors';

const whitelist = process.env.CORS_ORIGIN_WHITELIST
  ? process.env.CORS_ORIGIN_WHITELIST.split(',')
  : [];

export const corsOptions: cors.CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
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
