import redis from "../DB/redis";

export const DeleteCachedKey = async (key) => {
  const keys = await redis.keys(key);
  if (keys.length > 0) {
    const result = await redis.del(keys);
    console.log(`${result} keys deleted successfully`);
  } else {
    console.log(`No keys starting with key ${key}`);
  }
};
