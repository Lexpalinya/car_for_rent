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
  page,
  select,

  orderBy = {
    created_at: "desc",
  }
) => {
  const cachData = await redis.get(key);
  let data;
  if (!cachData) {
    data = await prisma[model].findMany({
      take: KLimit,
      skip: KLimit * page,
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
    await CachDataAll(key, model, where, select, orderBy);
    return results;
  }
  const data = JSON.parse(cachedData);

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
    await redis.set(key, JSON.stringify(data));
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
    await CachDataNoClear(key, model, where, select, orderBy);
    return results;
  }
  const data = JSON.parse(cachedData);

  const result = data.find((item) => {
    return item.id == where.id;
  });

  return result || null;
};
