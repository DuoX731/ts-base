import logger from '../util/logger';
import { config } from '../config/config';
import mongoose, { Connection, ConnectOptions  } from 'mongoose';

class MongoDBConnectionManager {
    private connections: { [key: string]: Connection } = {};
    private defaultDbName: string = 'defaultDb';

    constructor(private defaultDbUrl: string) {}

    private createConnection(uri: string, options?: ConnectOptions): Connection {
        const defaultOptions: ConnectOptions = {
            retryWrites: true,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 45000,
            readConcern: { level: 'local' },
        };

        const customOptions = { ...defaultOptions, ...options };

        mongoose.set('maxTimeMS', 1800000);

        const connection = mongoose.createConnection(uri, customOptions);

        connection.once('open', () => {
            logger.log(`Mongoose connected to ${uri}`);
        });

        connection.on('error', (err) => {
            logger.error(`Mongoose connection error: ${err}`);
        });

        connection.on('disconnected', () => {
            logger.error('Mongoose disconnected');
        });

        connection.on('reconnected', () => {
            logger.log('Mongoose reconnected');
        });

        connection.on('close', () => {
            logger.error('Mongoose connection closed');
        });

        return connection;
    }

    connect(dbName: string = this.defaultDbName): Connection {
        try {
            this.connections[dbName] = this.createConnection(this.defaultDbUrl);
            return this.connections[dbName];
        } catch (error) {
            console.error('Failed to initialize DB connections:', error);
            throw error;
        }
    }

    disconnect(): Promise<void> {
        return mongoose.connection.close();
    }

    getConnection(key: string = this.defaultDbName): Connection | undefined {
        if (!this.connections[key]) {
            console.error(`Connection not found for key: ${key}`);
            return;
        }
        return this.connections[key];
    }
}

const database = new MongoDBConnectionManager(config.database.uri);
export default database;