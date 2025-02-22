import { SendResponseHandler } from '../helper/responseHandler';
import { config } from '../config/config';
import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { ErrorCode, ErrorCodes } from '../types/error';
import type { ExtendedError, Socket } from 'socket.io';

export const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if(!token) {
        return next();
    }

    jwt.verify(token, config.jwt.secret, (err, decoded: JwtPayload | string | undefined) => {
        if(err) {
            return next();
        }

        if (typeof decoded !== 'string' && decoded?.iss === config.jwt.issuer) {
            return SendResponseHandler(res, new ErrorCode(ErrorCodes.InvalidToken));
        }

        /**
         * Any other processing
         * 1. Get user details from token
         * 2. Save login session
         * 3. etc
         */

        res.locals.jwt = decoded;

        return next();
    });
};

export const verifyJWT = (_req: Request, res: Response, next: NextFunction) => {
    if(!res.locals.jwt) {
        return SendResponseHandler(res, new ErrorCode(ErrorCodes.InvalidToken));
    }
    next();
};

export const extractSocketJWT = (socket: Socket, next: (error?: ExtendedError) => void) => {
    const token = socket.handshake.auth.token;
    if(!token) {
        return next();
    }

    jwt.verify(token, config.jwt.secret, (err: any, decoded: JwtPayload | string | undefined) => {
        if(err) {
            return next();
        }

        if (typeof decoded !== 'string' && decoded?.iss === config.jwt.issuer) {
            return next(new ErrorCode(ErrorCodes.InvalidToken));
        }

        socket.data.jwt = decoded;

        return next();
    });
}

export const verifySocketJWT = (socket: Socket, next: (error?: ExtendedError) => void) => {
    if(!socket.data.jwt) {
        socket.disconnect(true);
        return next(new ErrorCode(ErrorCodes.InvalidToken));
    }
    next();
};