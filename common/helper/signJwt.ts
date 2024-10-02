import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { ErrorCode } from '../types/error';

export const signJwt = async (payload: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            config.jwt.secret, 
            { 
                expiresIn: config.jwt.expiry, 
                issuer: config.jwt.issuer,
                algorithm: 'HS256'
            },
            (err, token) => {
                if(err) {
                    reject(
                        new ErrorCode({
                            error: err.message,
                            description: 'Error signing JWT',
                        }),
                    );
                }

                if(token) {
                    resolve(token);
                }
            }
        )
    });
}