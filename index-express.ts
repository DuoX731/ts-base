import { config } from '@common/config/config';
import { app } from './src/app/express';

const port = config.port || 3000;
const basePath = '/api/v1';

app.get('/', (_, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});