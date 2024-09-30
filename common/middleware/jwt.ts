import { config } from '../config/config';
import type { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
            return res.status(401).json({ error: '', message: 'Invalid Token'});
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
        return res.status(401).json({ error: '', message: 'Invalid Token'});
    }
    next();
};