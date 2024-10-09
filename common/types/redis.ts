import type { Types } from 'mongoose';

export type ConvertToString<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? ConvertToString<T[K]> : string;
};

export type RedisJsonGetOptions = {
    path?: string | Array<string>;
    INDENT?: string;
    NEWLINE?: string;
    SPACE?: string;
    NOESCAPE?: true;
};

export type CustomRedisJsonGetOptions = {
    ttl?: number;
    resetIfNotFound?: boolean;
};

export type ConvertToRedisJson<T> = T extends Types.ObjectId | Date | string
    ? string
    : T extends number | boolean
      ? T
      : T extends (infer U)[]
        ? ConvertToRedisJson<U>[]
        : T extends Record<string | number, unknown>
          ? { [K in keyof T]: ConvertToRedisJson<T[K]> }
          : T;