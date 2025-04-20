const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'Pragma',
        'Expires',
        'If-None-Match',
        'ETag'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'ETag'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
}

module.exports = corsOptions