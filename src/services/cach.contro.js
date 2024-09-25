import { KLimit } from "../config/api.config";
import redis from "../DB/redis";
import prisma from "../utils/prisma.client";

export const CachDataAll = async (
  key,
  model,
  where = { is_active: true },
  select,
  orderBy = {
    created_at: "desc",
  }
) => {
  const cachData = await redis.get(key);
  let data;
  if (!cachData) {
    data = await prisma[model].findMany({
      where,
      select,
      orderBy,
    });
    await redis.set(key, JSON.stringify(data), "EX", 3600);
  } else {
    data = JSON.parse(cachData);
  }
  return data;
};

export const CachDataLimit = async (
  key,
  model,
  where = { is_active: true },
  page = 0,
  select,

  orderBy = {
    created_at: "desc",
  }
) => {
  // await redis.del(key);
  const cachData = await redis.get(key);
  let data;
  if (!cachData) {
    console.log("model :>> ", model);
    data = await prisma[model].findMany({
      take: KLimit,
      skip: KLimit * page,
      where,
      select,
      orderBy,
    });
    const count = await prisma[model].count({
      where,
    });
    data = {
      count,
      data,
    };

    await redis.set(key, JSON.stringify(data), "EX", 3600);
  } else {
    data = JSON.parse(cachData);
  }

  return data;
};

export const CachDataFindById = async (
  key,
  model,
  where,
  select,
  orderBy = {
    created_at: "desc",
  }
) => {
  let cachedData = await redis.get(key);
  if (!cachedData) {
    const results = await prisma[model].findUnique({ where, select });
    await redis.set(key, JSON.stringify(results), "EX", 3600);
    return results;
  }
  let data = JSON.parse(cachedData);
  if (!Array.isArray(data)) {
    return data;
  }

  const result = data.find((item) => {
    return item.id == where.id;
  });

  return result || null;
};

export const CachDataNoClear = async (
  key,
  model,
  where = { is_active: true },
  select,
  orderBy = {
    created_at: "desc",
  }
) => {
  const cachData = await redis.get(key);
  let data;
  if (!cachData) {
    data = await prisma[model].findMany({
      where,
      select,
      orderBy,
    });
    await redis.set(key, JSON.stringify(data), "EX", 3600);
  } else {
    data = JSON.parse(cachData);
  }
  return data;
};

export const CachDataFindByIdNoClear = async (
  key,
  model,
  where,
  select,
  orderBy = {
    created_at: "desc",
  }
) => {
  let cachedData = await redis.get(key);
  if (!cachedData) {
    const results = await prisma[model].findUnique({ where, select });
    delete where.id;
    await CachDataNoClear(key, model, where, select, orderBy);
    return results;
  }
  const data = JSON.parse(cachedData);

  // console.log("data :>> ", data, where.id);
  const result = data.find((item) => {
    // console.log('object :>> ', item.id == where.id);
    return item.id == where.id;
  });
  // console.log("result :>> ", result);
  return result || null;
};

export const CachDataFindUserNoClear = async (
  key,
  model,
  where,
  select,
  search,
  orderBy = {
    created_at: "desc",
  }
) => {
  let cachedData = await redis.get(key);
  if (!cachedData) {
    const results = await prisma[model].findFirst({ where, select });

    await CachDataNoClear(key, model, { is_active: true }, select, orderBy);
    return results;
  }
  const data = JSON.parse(cachedData);

  // Enhanced find condition
  const result = data.find((item) => {
    // Check if the search field exists in the item and matches the condition
    return item[search] !== undefined && item[search] === where[search];
  });
  return result || null;
};

export const CachDataFindDataId_One = async (key, model, where, select) => {
  let cachedData = await redis.get(key);
  if (!cachedData) {
    const results = await prisma[model].findUnique({ where, select });
    await redis.set(key, JSON.stringify(results), "EX", 3600);
    return results;
  }
  const result = JSON.parse(cachedData);

  return result || null;
};
