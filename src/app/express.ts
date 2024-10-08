import { initializeRedis } from '@common/database/redis';
import { expressLogger } from '@common/middleware/expressLogger';
import { extractJWT } from '@common/middleware/jwt';
import { expressRateLimiter } from '@common/middleware/rateLimiter';
import bodyParser from 'body-parser';
import express from 'express';

initializeRedis();
export const app = express();

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, nonce');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(expressRateLimiter());
app.use(extractJWT);
app.use(expressLogger);