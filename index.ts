import { initializeRedis } from "@common/database/redis";

initializeRedis();

/**
 * To only use ts base without express
 * 1. npm uninstall express @types/express express-rate-limit rate-limit-redis body-parser @types/body-parser http 
 * 2. Delete files below:
 * - src/app/
 * - common/middleware/
 * - common/helper/responseHandler.ts
 */