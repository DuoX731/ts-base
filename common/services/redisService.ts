import { RedisClientType } from "@redis/client";
import { redisClient } from "../database/redis";

export class RedisService {
    private _client: RedisClientType;

    constructor() {
        if(!redisClient) {
            throw new Error('Redis client not found');
        }
        this._client = redisClient;
    }


    async get(key: string): Promise<string | null> {
        try {
            return await this._client.get(key);
        } catch (error) {
            throw new Error(`Error getting key ${key}: ${error}`);
        }
    }

    get client(): RedisClientType {
        return this._client;
    }
}