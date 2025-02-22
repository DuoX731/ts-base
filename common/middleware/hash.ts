import type { NextFunction, Request, Response } from 'express';
import md5 from 'md5';
import { config } from '../config/config';
import { ErrorCode, ErrorCodes } from '../types/error';
import { SendResponseHandler } from '../helper/responseHandler';
import dayjs from 'dayjs';
import type { ExtendedError, Socket } from 'socket.io';

export const validateHash = (req: Request, res: Response, next: NextFunction) => {
    const nonce = req.header('nonce');

    if(!nonce){
        return SendResponseHandler(res, new ErrorCode(ErrorCodes.InvalidHash));
    }

    const diff = dayjs().diff(dayjs(Number.parseInt(nonce)), 'seconds');
    if(diff > 30){
        return SendResponseHandler(res, new ErrorCode(ErrorCodes.InvalidHash));
    }

    if(!verifyHash(req.body, Number.parseInt(nonce))){
        return SendResponseHandler(res, new ErrorCode(ErrorCodes.InvalidHash));
    }

    next();
}

export const validateSocketConnection = (socket: Socket, next: (err?: ExtendedError) => void) => {
    const nonce = socket.handshake.headers.nonce;
    if(!nonce){
        return next(new ErrorCode(ErrorCodes.InvalidHash));
    }

    const diff = dayjs().diff(dayjs(Number.parseInt(nonce as string)), 'seconds');
    if(diff > 30){
        return next(new ErrorCode(ErrorCodes.InvalidHash));
    }
    next();
}

function verifyHash({hash, ...object}: { hash: string, [key: string]: any }, nonce: number) {
    const sortedObject = Object.keys({...object, nonce}).sort().reduce((acc, key) => {
        acc[key] = object[key];
        return acc;
    }, {} as { [key: string]: any });

    const hashString = md5(JSON.stringify(sortedObject) + config.hash.secret);
    return hash === hashString;
}