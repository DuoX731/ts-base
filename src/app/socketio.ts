import { socketLogger } from "@common/middleware/expressLogger";
import { validateSocketConnection } from "@common/middleware/hash";
import { extractSocketJWT } from "@common/middleware/jwt";
import { Server } from "socket.io";

/**
 * 
 * Sample client-side connection properties (more to be added):
 * {
 *  extraHeaders: {
 *    nonce: new Date().getTime()
 *  }
 * }
 */
export function createSocket(httpServer: any) {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            allowedHeaders: ['Content-Type', 'Authorization', 'nonce'],
            credentials: true
        }
    });

    io.use(validateSocketConnection);
    io.use(extractSocketJWT);
    io.use(socketLogger);

    return io;
}