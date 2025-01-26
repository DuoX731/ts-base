import type { ObjectId, CountOptions, DeleteOptions, UpdateOptions } from 'mongodb';
import type {
    AggregateOptions as MongooseAggregateOptions,
    AnyKeys,
    HydratedDocument,
    Model,
    PipelineStage,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
} from 'mongoose';
import type {
    AggregateOptions,
    FilterQuery,
    FindByIdOptions,
    FindOneAndUpdateOptions,
    FindOneOptions,
    FindOptions,
    GetLeanResultType,
    MergeType,
    MongooseBaseQueryOptions,
    MongooseUpdateQueryOptions,
    QueryWithHelpers,
    UnpackedIntersection,
    PopulateOptions
} from './types';

export function BaseFunction<
    TRawDocType,
    TQueryHelpers = {},
    TInstanceMethods = {},
    TVirtual = {},
    THydratedDocumentType = HydratedDocument<TRawDocType, TVirtual & TInstanceMethods, TQueryHelpers>,
>() {
    return class Base {
        protected static batchSize: number = 250;
        protected static collection: Model<
            TRawDocType,
            TQueryHelpers,
            TInstanceMethods,
            TVirtual,
            THydratedDocumentType
        >;
        protected static defaultTimeout: number = Number.isNaN(Number(process.env.MAX_TIME_MS_TIMEOUT))
            ? 5000
            : Number(process.env.MAX_TIME_MS_TIMEOUT);

        static aggregate(aggregate: PipelineStage[], options: AggregateOptions = {}) {
            let { allowDisk: allowDiskUse = true, isSecondary = false, maxTimeOut = 60000 } = options;

            let queryOptions: MongooseAggregateOptions = {
                maxTimeMS: maxTimeOut > Base.defaultTimeout ? maxTimeOut : Base.defaultTimeout,
                allowDiskUse,
            };

            let query = this.collection.aggregate(aggregate, queryOptions);

            if (isSecondary) {
                query.read('secondaryPreferred');
            }

            return query;
        }

        static count(
            filter: FilterQuery<TRawDocType>,
            maxTimeout?: number,
            options?: (CountOptions & MongooseBaseQueryOptions<TRawDocType>) | null,
        ): Promise<number> {
            return this.collection
                .countDocuments(filter, options)
                .maxTimeMS(maxTimeout && maxTimeout > Base.defaultTimeout ? maxTimeout : Base.defaultTimeout);
        }

        static save<DocContents = AnyKeys<TRawDocType>>(
            payload: Array<TRawDocType | DocContents>,
        ): Promise<THydratedDocumentType[]>;

        static save<DocContents = AnyKeys<TRawDocType>>(
            payload: DocContents | TRawDocType,
        ): Promise<THydratedDocumentType>;

        static save<DocContents = AnyKeys<TRawDocType>>(
            payload: DocContents | TRawDocType | Array<TRawDocType | DocContents>,
        ): Promise<THydratedDocumentType | THydratedDocumentType[]> {
            return this.collection.create(payload);
        }

        static deleteMany(
            filter: FilterQuery<TRawDocType>,
            options?: (DeleteOptions & MongooseBaseQueryOptions<TRawDocType>) | null,
        ) {
            return this.collection.deleteMany(filter, options).then((deletedDocument) => {
                return deletedDocument.deletedCount && deletedDocument.acknowledged;
            });
        }

        static deleteOne(
            filter: FilterQuery<TRawDocType>,
            options?: (DeleteOptions & MongooseBaseQueryOptions<TRawDocType>) | null,
        ) {
            return this.collection.deleteOne(filter, options).then((deletedDocument) => {
                return deletedDocument.deletedCount && deletedDocument.acknowledged;
            });
        }

        static findById<ResultDoc = THydratedDocumentType>(
            id: ObjectId,
            options?: Partial<FindByIdOptions>,
        ): QueryWithHelpers<ResultDoc | null, ResultDoc, TQueryHelpers, TRawDocType, 'findOne', TInstanceMethods>;

        static findById<PopulatePaths, ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options: Partial<FindOneOptions> & { populate: PopulateOptions[] },
        ): QueryWithHelpers<
            MergeType<ResultDoc, PopulatePaths> | null,
            ResultDoc,
            TQueryHelpers,
            UnpackedIntersection<TRawDocType, PopulatePaths>,
            'findOne',
            TInstanceMethods
        >;

        static findById<ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options: Partial<FindOneOptions> & { isCursor?: false },
        ): QueryWithHelpers<
            GetLeanResultType<TRawDocType, TRawDocType, 'findOne'> | null,
            ResultDoc,
            TQueryHelpers,
            TRawDocType,
            'findOne',
            TInstanceMethods
        >;

        static findById<PopulatePaths, ResultDoc = THydratedDocumentType>(
            id: ObjectId,
            options?: FindByIdOptions,
        ):
            | QueryWithHelpers<ResultDoc | null, ResultDoc, TQueryHelpers, TRawDocType, 'findOne', TInstanceMethods>
            | QueryWithHelpers<
                  MergeType<ResultDoc, PopulatePaths> | null,
                  ResultDoc,
                  TQueryHelpers,
                  UnpackedIntersection<TRawDocType, PopulatePaths>,
                  'findOne',
                  TInstanceMethods
              >
            | QueryWithHelpers<
                  GetLeanResultType<TRawDocType, TRawDocType, 'findOne'> | null,
                  ResultDoc,
                  TQueryHelpers,
                  TRawDocType,
                  'findOne',
                  TInstanceMethods
              > {
            let query = this.collection.findById<ResultDoc>(id);

            if (options?.sort || (typeof options?.sort === 'object' && Object.keys(options.sort).length)) {
                query.sort(options.sort);
            }

            if (
                options?.project ||
                (Array.isArray(options?.project) && options?.project.length) ||
                (typeof options?.project === 'object' && Object.keys(options.project).length)
            ) {
                query.select(options.project);
            }

            if (options?.isSecondary) {
                query.read('secondaryPreferred');
            }

            if (!options?.isCursor) {
                query.lean({ getters: true });
            }

            if (options?.populate?.length) {
                query.populate(options?.populate);
            }

            return query.maxTimeMS(
                options?.maxTimeOut && options?.maxTimeOut > Base.defaultTimeout
                    ? options?.maxTimeOut
                    : Base.defaultTimeout,
            );
        }

        static find<ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options?: Partial<FindOptions>,
        ): QueryWithHelpers<Array<ResultDoc>, ResultDoc, TQueryHelpers, TRawDocType, 'find', TInstanceMethods>;

        static find<ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options: Partial<FindOptions> & { isCursor?: false },
        ): QueryWithHelpers<
            GetLeanResultType<TRawDocType, TRawDocType[], 'find'>,
            ResultDoc,
            TQueryHelpers,
            TRawDocType,
            'find',
            TInstanceMethods
        >;

        static find<PopulatePaths, ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options: Partial<FindOptions> & { populate: PopulateOptions[] },
        ): QueryWithHelpers<
            Array<MergeType<ResultDoc, PopulatePaths>>,
            ResultDoc,
            TQueryHelpers,
            UnpackedIntersection<TRawDocType, PopulatePaths>,
            'find',
            TInstanceMethods
        >;

        static find<PopulatePaths, ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options: FindOptions = {},
        ):
            | QueryWithHelpers<Array<ResultDoc>, ResultDoc, TQueryHelpers, TRawDocType, 'find', TInstanceMethods>
            | QueryWithHelpers<
                  GetLeanResultType<TRawDocType, TRawDocType[], 'find'>,
                  ResultDoc,
                  TQueryHelpers,
                  TRawDocType,
                  'find',
                  TInstanceMethods
              >
            | QueryWithHelpers<
                  Array<MergeType<ResultDoc, PopulatePaths>>,
                  ResultDoc,
                  TQueryHelpers,
                  UnpackedIntersection<TRawDocType, PopulatePaths>,
                  'find',
                  TInstanceMethods
              > {
            let query = this.collection.find<ResultDoc>(filter);

            if (options.sort || (typeof options.sort === 'object' && Object.keys(options.sort).length)) {
                query.sort(options.sort);
            }

            if (
                options.project ||
                (Array.isArray(options.project) && options.project.length) ||
                (typeof options.project === 'object' && Object.keys(options.project).length)
            ) {
                query.select(options.project);
            }

            if (options.skip) {
                query.skip(options.skip);
            }

            if (options.limit) {
                query.limit(options.limit);
            }

            if (options.isSecondary) {
                query.read('secondaryPreferred');
            }

            if (options.populate?.length) {
                query.populate(options.populate);
            }

            if (options.isCursor) {
                query.cursor({ batchSize: options.batchSize ? options.batchSize : Base.batchSize });
            }

            if (!options.isCursor) {
                query.lean({ getters: true });
            }

            return query.maxTimeMS(
                options.maxTimeOut && options.maxTimeOut > Base.defaultTimeout
                    ? options.maxTimeOut
                    : Base.defaultTimeout,
            );
        }

        static findOne<ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options?: Partial<FindOneOptions>,
        ): QueryWithHelpers<ResultDoc | null, ResultDoc, TQueryHelpers, TRawDocType, 'findOne', TInstanceMethods>;

        static findOne<PopulatePaths, ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options: Partial<FindOneOptions> & { populate: PopulateOptions[] },
        ): QueryWithHelpers<
            MergeType<ResultDoc, PopulatePaths> | null,
            ResultDoc,
            TQueryHelpers,
            UnpackedIntersection<TRawDocType, PopulatePaths>,
            'findOne',
            TInstanceMethods
        >;

        static findOne<PopulatePaths, ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            options: FindOneOptions = {},
        ):
            | QueryWithHelpers<ResultDoc | null, ResultDoc, TQueryHelpers, TRawDocType, 'findOne', TInstanceMethods>
            | QueryWithHelpers<
                  MergeType<ResultDoc, PopulatePaths> | null,
                  ResultDoc,
                  TQueryHelpers,
                  UnpackedIntersection<TRawDocType, PopulatePaths>,
                  'findOne',
                  TInstanceMethods
              > {
            let query = this.collection.findOne<ResultDoc>(filter);

            if (options.sort || (typeof options.sort === 'object' && Object.keys(options.sort).length)) {
                query.sort(options.sort);
            }

            if (
                options.project ||
                (Array.isArray(options.project) && options.project.length) ||
                (typeof options.project === 'object' && Object.keys(options.project).length)
            ) {
                query.select(options.project);
            }

            if (options.isSecondary) {
                query.read('secondaryPreferred');
            }

            if (!options.isCursor) {
                query.lean({ getters: true });
            }

            if (options.populate?.length) {
                query.populate(options.populate);
            }

            return query.maxTimeMS(
                options.maxTimeOut && options.maxTimeOut > Base.defaultTimeout
                    ? options.maxTimeOut
                    : Base.defaultTimeout,
            );
        }

        static findOneAndUpdate<ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
            options: FindOneAndUpdateOptions,
        ): QueryWithHelpers<
            ResultDoc | null,
            ResultDoc,
            TQueryHelpers,
            TRawDocType,
            'findOneAndUpdate',
            TInstanceMethods
        >;

        static findOneAndUpdate<ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
            options: FindOneAndUpdateOptions & { isCursor?: false },
        ): QueryWithHelpers<
            GetLeanResultType<TRawDocType, TRawDocType, 'findOneAndUpdate'> | null,
            ResultDoc,
            TQueryHelpers,
            TRawDocType,
            'findOneAndUpdate',
            TInstanceMethods
        >;

        static findOneAndUpdate<ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
            options: FindOneAndUpdateOptions & { upsert: true; returnNew: true },
        ): QueryWithHelpers<ResultDoc, ResultDoc, TQueryHelpers, TRawDocType, 'findOneAndUpdate', TInstanceMethods>;

        static findOneAndUpdate<ResultDoc = THydratedDocumentType>(
            filter: FilterQuery<TRawDocType>,
            update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
            options: FindOneAndUpdateOptions,
        ):
            | QueryWithHelpers<
                  ResultDoc | null,
                  ResultDoc,
                  TQueryHelpers,
                  TRawDocType,
                  'findOneAndUpdate',
                  TInstanceMethods
              >
            | QueryWithHelpers<
                  GetLeanResultType<TRawDocType, TRawDocType, 'findOneAndUpdate'> | null,
                  ResultDoc,
                  TQueryHelpers,
                  TRawDocType,
                  'findOneAndUpdate',
                  TInstanceMethods
              > {
            let {
                maxTimeOut = Base.defaultTimeout,
                upsert = false,
                returnNew = false,
                setDefaultsOnInsert = true,
                isCursor = false,
            } = options;

            let mongooseOptions: QueryOptions<TRawDocType> = {
                upsert,
                new: returnNew,
                lean: isCursor
                    ? false
                    : {
                          getters: true,
                      },
                setDefaultsOnInsert,
                maxTimeMS: maxTimeOut > Base.defaultTimeout ? maxTimeOut : Base.defaultTimeout,
            };

            if (
                options.projection ||
                (Array.isArray(options.projection) && options.projection.length) ||
                (typeof options.projection === 'object' && Object.keys(options.projection).length)
            ) {
                mongooseOptions.projection = options.projection;
            }

            let query = this.collection.findOneAndUpdate<ResultDoc>(filter, update, mongooseOptions);

            return query.maxTimeMS(maxTimeOut);
        }

        static updateOne(
            filter: FilterQuery<TRawDocType>,
            updatePayload: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
            options?: (UpdateOptions & MongooseUpdateQueryOptions<TRawDocType>) | null,
            maxTimeout?: number,
        ): Promise<boolean> {
            return this.collection
                .updateOne(filter, updatePayload, options)
                .maxTimeMS(maxTimeout && maxTimeout > Base.defaultTimeout ? maxTimeout : Base.defaultTimeout)
                .then((updatedResult) => {
                    return !(!updatedResult || !updatedResult.modifiedCount || !updatedResult.matchedCount);
                });
        }

        static updateMany(
            filter: FilterQuery<TRawDocType>,
            payload: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
            options?: (UpdateOptions & MongooseUpdateQueryOptions<TRawDocType>) | null,
            maxTimeout?: number,
        ): Promise<boolean> {
            return this.collection
                .updateMany(filter, payload, options)
                .maxTimeMS(maxTimeout && maxTimeout > Base.defaultTimeout ? maxTimeout : Base.defaultTimeout)
                .then((updatedResult) => {
                    return !(!updatedResult || !updatedResult.modifiedCount || !updatedResult.matchedCount);
                });
        }

        static populate<ResultDoc = THydratedDocumentType>(
            docs: Array<any>,
            options: PopulateOptions[],
        ): Array<ResultDoc>;

        static populate<PopulatePaths, ResultDoc = THydratedDocumentType>(
            docs: Array<any>,
            options: PopulateOptions[],
        ): Array<MergeType<ResultDoc, PopulatePaths>>;

        static populate<ResultDoc = THydratedDocumentType>(docs: any, options: PopulateOptions[]): ResultDoc;

        static populate<PopulatePaths, ResultDoc = THydratedDocumentType>(
            docs: any,
            options: PopulateOptions[],
        ): MergeType<ResultDoc, PopulatePaths>;

        // Populate after Query
        static populate<PopulatePaths, ResultDoc = THydratedDocumentType>(
            docs: Array<any> | any,
            populate: PopulateOptions[],
        ):
            | Array<ResultDoc>
            | Array<MergeType<ResultDoc, PopulatePaths>>
            | ResultDoc
            | MergeType<ResultDoc, PopulatePaths> {

            return this.collection.populate(docs, populate) as
                | Array<ResultDoc>
                | Array<MergeType<ResultDoc, PopulatePaths>>
                | ResultDoc
                | MergeType<ResultDoc, PopulatePaths>;
        }

        static bulkWrite(payload: any) {
            return this.collection.bulkWrite(payload);
        }
    };
}