import { config } from '@common/config/config';
import { app } from './src/app/express';
import { createServer } from 'http';
import { createSocket } from 'src/app/socketio';
import { Socket } from 'socket.io';

const port = config.port || 3000;
const httpServer = createServer(app);
const io = createSocket(httpServer);
const basePath = '/api/v1';

app.get('/', (_, res) => {
    res.send('Hello World!');
})

const onConnnection = (socket: Socket) => {
    // Add your socket routes here
    // Sample creation of socket routes: https://socket.io/docs/v4/server-application-structure/
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
}

io.on('connection', onConnnection);

httpServer.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});