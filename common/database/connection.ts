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
            console.log(`Mongoose connected to ${uri}`);
        });

        connection.on('error', (err) => {
            console.error(`Mongoose connection error: ${err}`);
        });

        connection.on('disconnected', () => {
            console.error('Mongoose disconnected');
        });

        connection.on('reconnected', () => {
            console.log('Mongoose reconnected');
        });

        connection.on('close', () => {
            console.error('Mongoose connection closed');
        });

        return connection;
    }

    connect(): void {
        try {
            this.connections[this.defaultDbName] = this.createConnection(this.defaultDbUrl, {
                replicaSet: config.database.default_name,
            });
        } catch (error) {
            console.error('Failed to initialize DB connections:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            console.log('Mongoose connections closed');
        } catch (error) {
            console.error('Error closing Mongoose connections:', error);
        }
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