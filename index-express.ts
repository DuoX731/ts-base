import { config } from '@common/config/config';
import { expressLogger } from '@common/middleware/expressLogger';
import { extractJWT } from '@common/middleware/jwt';
import bodyParser from 'body-parser';
import express from 'express';

const app = express();
const port = config.port || 3000;
const basePath = '/api/v1';

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, nonce');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(extractJWT);
app.use(expressLogger);


app.get('/', (_, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

