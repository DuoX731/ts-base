import { config } from '../config/config';
import type { RedisClientType } from '@redis/client';
import { createClient } from 'redis';


export let redisClient: RedisClientType;

export async function initializeRedis(){
    if(!config.redis.enable){
        return;
    }
    redisClient = createClient({
        socket: {
            host: config.redis.host,
            port: config.redis.port,
        },
        password: config.redis.password,
        username: config.redis.username,
    });

    await redisClient.connect()
    .then(() => {
        console.log('Redis connected');
        // Any other initialization
    })
}