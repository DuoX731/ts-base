import 'dotenv/config'

/**
 * Configuration settings for the application
 */
export const config = {
    environment: process.env.APP_ENV || 'DEV',
    port: Number.parseInt(process.env.PORT || '3000', 10),
    database: {
        uri: process.env.MONGODB_URI || '',
        default_name: process.env.DEFAULT_DB_NAME || 'default',
    },
    settlement: {
        processes: Number.parseInt(process.env.SETTLEMENT_PROCESS || '0', 16),
        url: process.env.SETTLEMENT_URL || '',
    },
    redis: {
        enable: process.env.ENABLE_REDIS === 'true',
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
        username: process.env.REDIS_USERNAME || '',
        password: process.env.REDIS_PASSWORD || '',
        timeout: Number.parseInt(process.env.REDIS_TIMEOUT || '3600', 10),
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
        expiry: Number.parseInt(process.env.JWT_EXPIRY || '3600', 10),
        issuer: process.env.JWT_ISSUER || ''
    },
    hash: {
        secret: process.env.HASH_SECRET || 'L3tM3In',
    },
    ratelimiter: {
        enable: process.env.ENABLE_RATELIMITER === 'true',
        limit: Number.parseInt(process.env.RATELIMITER_LIMIT || '100', 10),
        window: Number.parseInt(process.env.RATELIMITER_WINDOW || '60000', 10),
    }
}