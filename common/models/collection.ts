import database_collection from "../database/properties";
import type { Model } from 'mongoose';
import { BaseFunction } from './base';

/** Schemas */
import { UserSchema } from "../schemas/user";

export class User extends BaseFunction<UserSchema>(){
    protected static collection: Model<UserSchema> = database_collection.user;
}