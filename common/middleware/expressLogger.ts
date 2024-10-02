import { ExtendedError, Socket } from 'socket.io';
import logger from '../util/logger';
import type { NextFunction, Request, Response } from 'express';

const uniqueId = () => Math.random().toString(36).substring(7);

export function expressLogger(req: Request, res: Response & { send: any }, next: NextFunction) {
    // Generate a unique id to track the request
    const id = uniqueId();
    logger.log(`${id} Req: ${req.method} ${req.originalUrl}, Body: ${JSON.stringify(req.body)}`);

    const originalSendFunc = res.send.bind(res);
    res.send = function (body: any) {
        logger.log(`${id} Res: ${req.method} ${req.originalUrl}, Status: ${res.statusCode}, Body: ${JSON.stringify(body)}`);
        originalSendFunc(body);
    }

    next();
}

export function socketLogger(socket: Socket & { emit: any }, next: (err?: ExtendedError) => void) {
    const id = uniqueId();

    logger.log(`${id} Socket connection opened: ${socket.handshake.address}`)
    socket.onAny((event: any, ...args: any) => {
        logger.log(`${id} Socket: ${socket.id}, Event: ${event}, Args: ${JSON.stringify(args)}`);
    });

    const originalEmit = socket.emit.bind(socket);
    socket.emit = function (event: string, ...args: any[]) {
        logger.log(`${id} Socket: ${socket.id}, Event: ${event}, Args: ${JSON.stringify(args)}`);
        originalEmit(event, ...args);
    }

    socket.on('disconnect', () => {
        logger.log(`${id} Socket connection closed: ${socket.handshake.address}`);
    });

    next();
}