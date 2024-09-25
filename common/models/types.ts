import type {
    FlattenMaps,
    MongooseBaseQueryOptionKeys,
    MongooseQueryOptions,
    Query,
    QueryOpThatReturnsDocument,
    QuerySelector,
    Require_id,
    RootQuerySelector,
    SortOrder,
} from 'mongoose';
import type { PopulateOptions } from './interfaces/populate';

export type Condition<T> = T | QuerySelector<T | any> | any;

export type FilterQuery<T> = {
    [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T>;

export type GetLeanResultType<RawDocType, ResultType, QueryOp> = QueryOp extends QueryOpThatReturnsDocument
    ? ResultType extends any[]
        ? Require_id<FlattenMaps<RawDocType>>[]
        : Require_id<FlattenMaps<RawDocType>>
    : ResultType;

export type MongooseBaseQueryOptions<DocType = unknown> = MongooseQueryOptions<DocType, MongooseBaseQueryOptionKeys>;

export type MongooseUpdateQueryOptions<DocType = unknown> = MongooseQueryOptions<
    DocType,
    MongooseBaseQueryOptionKeys | 'timestamps'
>;

export type QueryWithHelpers<
    ResultType,
    DocType,
    THelpers = {},
    RawDocType = DocType,
    QueryOp = 'find',
    TInstanceMethods = Record<string, never>,
> = Query<ResultType, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods> & THelpers;

export type UnpackedIntersection<T, U> = T extends null
    ? null
    : T extends (infer A)[]
      ? (Omit<A, keyof U> & U)[]
      : keyof U extends never
          ? T
          : Omit<T, keyof U> & U;

export type MergeType<A, B> = Omit<A, keyof B> & B;

export type Projection = string | string[] | Record<string, number | boolean | string | object>;
export type Sort = string | Record<string, SortOrder>;

export type AggregateOptions = {
    isSecondary?: boolean;
    allowDisk?: boolean;
    maxTimeOut?: number;
};

export type FindOptions = {
    sort?: Sort;
    skip?: number;
    limit?: number;
    batchSize?: number;
    isCursor?: boolean;
    maxTimeOut?: number;
    project?: Projection;
    isSecondary?: boolean;
    populate?: PopulateOptions[];
};

export type FindOneOptions = {
    sort?: Sort;
    isCursor?: boolean;
    maxTimeOut?: number;
    project?: Projection;
    isSecondary?: boolean;
    populate?: PopulateOptions[];
};

export type FindByIdOptions = FindOneOptions;

export type FindOneAndUpdateOptions = {
    upsert?: boolean;
    isCursor?: boolean;
    returnNew?: boolean;
    maxTimeOut?: number;
    projection?: Projection;
    setDefaultsOnInsert?: boolean;
};
