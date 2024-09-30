import logger from "../util/logger";
import { ErrorCode } from "../types/error";
import type { Response } from 'express';

export const SendResponseHandler = (res: Response, error: ErrorCode | unknown) => {
    if(error instanceof ErrorCode){
        return res.status(error.code).send({ error: error.error, description: error.description });
    }

    logger.error('An error occurred while processing your request', error);
    return res.status(500).send({ error: 'Internal server error', description: 'An error occurred while processing your request' });
}