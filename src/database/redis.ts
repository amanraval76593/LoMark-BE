import Redis from "ioredis"
import config from "../config";

const redisClient = new Redis({
    host: config.REDIS_HOST,
    port: Number(config.REDIS_PORT),
    maxRetriesPerRequest: 5,
    retryStrategy(times) {
        return Math.min(times * 100, 2000);
    },
})

redisClient.on("connect", () => {
    console.log("✅ Redis connected")
})

redisClient.on("error", (err) => {
    console.error("❌ Redis error", err);
})

export default redisClient