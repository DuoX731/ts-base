import { type Model } from 'mongoose';
import database from './connection';
import { userSchema } from '../schemas/user';

let database_collection: { [key: string]: Model<any> } = {};

database.connect();
const connection = database.getConnection();
if(!connection) {
    throw new Error('Connection not found');
}

// Collection Initialization
database_collection.user = connection.model('User', userSchema, 'User');

// Index checker
for(let key in database_collection){
    const model: Model<any> = database_collection[key];
    ((key, model) => {
        model.on('index', (err: any) => {
            if (err) {
                console.warn(`Indexing error for model ${key}: ${err}`);
            }
        });
    })(key, model);
}

export default database_collection;