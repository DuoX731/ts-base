import logger from '../util/logger';
import type { NextFunction, Request, Response } from 'express';

export function expressLogger(req: Request, res: any, next: NextFunction) {
    // Generate a unique id to track the request
    const id = Math.random().toString(36).substring(7);
    logger.log(`${id} Req: ${req.method} ${req.originalUrl}, Body: ${JSON.stringify(req.body)}`);

    const originalSendFunc = res.send.bind(res);
    res.send = function (body: any) {
        logger.log(`${id} Res: ${req.method} ${req.originalUrl}, Status: ${res.statusCode}, Body: ${JSON.stringify(body)}`);
        originalSendFunc(body);
    }

    next();
}