import express from 'express';
import { database_connect } from './db/connection.js';
import routerHandler from './utils/controllers-handler.utils.js';
import { config } from 'dotenv';
import path from 'path';

config(
    { path: path.resolve(`src/config/.${process.env.NODE_ENV}.env`) }
); // Load environment variables from .env file

async function bootstrap() {
    const app = express();

    app.use(express.json());
    routerHandler(app);

    await database_connect();

    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}

export default bootstrap;
