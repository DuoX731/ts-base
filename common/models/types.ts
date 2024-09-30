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

import type { Model, QueryOptions } from 'mongoose';

export interface PopulateOptions {
    /** space delimited path(s) to populate */
    path: string;

    /** fields to select */
    select?: any;

    /** query conditions to match */
    match?: any;

    /** optional model to use for population */
    model?: string | Model<any>;

    /** optional query options like sort, limit, etc */
    options?: QueryOptions;

    /** correct limit on populated array */
    perDocumentLimit?: number;

    /** optional boolean, set to `false` to allow populating paths that aren't in the schema */
    strictPopulate?: boolean;

    /** deep populate */
    populate?: string | PopulateOptions | (string | PopulateOptions)[];

    /**
     * If true Mongoose will always set `path` to a document, or `null` if no document was found.
     * If false Mongoose will always set `path` to an array, which will be empty if no documents are found.
     * Inferred from schema by default.
     */
    justOne?: boolean;

    /** transform function to call on every populated doc */
    transform?: (doc: any, id: any) => any;

    /** Overwrite the schema-level local field to populate on if this is a populated virtual. */
    localField?: string;

    /** Overwrite the schema-level foreign field to populate on if this is a populated virtual. */
    foreignField?: string;
}

export interface PopulateOption {
    populate?: string | string[] | PopulateOptions | PopulateOptions[];
}
