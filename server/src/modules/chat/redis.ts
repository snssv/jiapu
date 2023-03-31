import * as Redis from 'ioredis';
import { errorLogger } from '../../logger';
import {config} from '../../config/';

let n: number = 0;
const redisIndex = []; // 用于记录 redis 实例索引
const redisList = []; // 用于存储 redis 实例

export class RedisInstance {
    static async initRedis(method: string, db: number = 0) {
        const isExist = redisIndex.some(x => x === db);
        if (!isExist) {
            errorLogger.debug(`[Redis ${db}]来自 ${method} 方法调用, Redis 实例化了 ${++n} 次 `);
            redisList[db] = new Redis({ ...config.redis, db });
            redisIndex.push(db);
        } else {
            errorLogger.debug(`[Redis ${db}]来自 ${method} 方法调用`);
        }
        return redisList[db];
    }
    static async xMax(name, met) {
        const redis = await RedisInstance.initRedis(met, 1);
        name = met+''+new Date().getDate()+name
        let maxL = await redis.get(name) || 0
        maxL = parseInt(maxL)+1
        await redis.setex(name, 86400000, maxL)
        return maxL
    }
}
