import { Options, rateLimit } from 'express-rate-limit'
import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '@common/database/redis';

const redisStore = (customPrefix?: string) => new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rate-limit/' + customPrefix,
});

// Base rate limiter
export const expressRateLimiter = () => {
    if(!config.ratelimiter.enable){
        return (_req: Request, _res: Response, next: NextFunction) => next();
    }

    const rateLimitConfig: Partial<Options> = {
        windowMs: config.ratelimiter.window,
        limit: config.ratelimiter.limit,
        standardHeaders: 'draft-7',
        legacyHeaders: true,
    };

    if(redisClient) {
        rateLimitConfig.store = redisStore();
    }

    return rateLimit(rateLimitConfig);
}

// Route specific rate limiter
export const customExpressRateLimiter = (limit: number, window: number, customPrefix?: string) => {
    const rateLimitConfig: Partial<Options> = {
        windowMs: window,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: true,
    };

    if(redisClient) {
        rateLimitConfig.store = redisStore(customPrefix);
    }

    return rateLimit(rateLimitConfig);
}