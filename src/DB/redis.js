import { Redis } from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../config/api.config";

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

redis.on("connect", () => {
  console.log(`Redis Connecting `);
});
redis.on("err", () => {
  console.error(`Redis connected error:${err}`);
});

export default redis;
