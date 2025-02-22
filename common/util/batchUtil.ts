import EventEmitter from 'node:events';
import type { Stream } from 'node:stream';

type StreamData = Record<string, any>;

class BatchedStream extends EventEmitter {
    private inputStream: Stream | any;
    private maxBatchSize: number;
    private batch: any[] = [];

    constructor(inputStream: Stream, maxBatchSize: number) {
        super();
        this.inputStream = inputStream;
        this.maxBatchSize = maxBatchSize;
        this.startFlowing();
    }

    pause() {
        this.inputStream.pause();
        return this;
    }

    resume() {
        this.inputStream.resume();
        return this;
    }

    close() {
        if (typeof this.inputStream.close === 'function') {
            this.inputStream.close();
        }
    }

    destroy() {
        if (typeof this.inputStream.destroy === 'function') {
            this.inputStream.destroy();
        }
    }

    private startFlowing() {
        this.inputStream.on('data', this.processData.bind(this));
        this.inputStream.on('end', () => {
            if (this.batch.length > 0) {
                this.sendBatch();
            }
            this.emit('end');
        });
        this.inputStream.on('error', (err: any) => this.emit('error', err));
    }

    private processData(data: StreamData) {
        this.batch.push(data);
        if (this.batch.length >= this.maxBatchSize) {
            this.sendBatch();
        }
    }

    private sendBatch() {
        this.emit('data', this.batch);
        this.batch.length = 0;  // Clear the array without reallocation
    }
}

function batchStream(inputStream: Stream, maxBatchSize: number): BatchedStream {
    return new BatchedStream(inputStream, maxBatchSize);
}

async function processStream<T>(
    stream: EventEmitter, 
    processOne: (data: T | T[]) => Promise<any>
): Promise<number> {
    const wrappedProcessOne = async (data: T | T[]) => {
        if (Array.isArray(data)) {
            return Promise.all(data.map(processOne));
        } else {
            return processOne(data);
        }
    };
    return processStreamConcurrently(stream, 1, wrappedProcessOne);
}

async function processStreamInBatches<T>(
    stream: Stream, 
    batchSize: number, 
    processBatch: (batch: T[]) => Promise<unknown[]>
): Promise<number> {
    const batchedStream = batchStream(stream, batchSize);
    return processStream(batchedStream, async (data: T | T[]) => {
        return processBatch(Array.isArray(data) ? data : [data]);
    });
}

async function processStreamConcurrently<T>(
    stream: EventEmitter | any, 
    maxWorkers: number, 
    processOne: (data: T | T[]) => Promise<any>
): Promise<number> {
    return new Promise((resolve, reject) => {
        let streamIsEnded = false;
        let activeWorkers = 0;
        let itemsProcessed = 0;

        const checkForCompletion = () => {
            if (streamIsEnded && activeWorkers === 0) {
                resolve(itemsProcessed);
            }
        };

        stream.on('data', (data: T | T[]) => {
            activeWorkers++;
            if (activeWorkers >= maxWorkers) {
                stream.pause();
            }

            processOne(data)
                .then(() => {
                    activeWorkers--;
                    if (activeWorkers < maxWorkers) {
                        stream.resume();
                    }
                    itemsProcessed++;
                    checkForCompletion();
                })
                .catch(reject);
        });

        stream.on('end', () => {
            streamIsEnded = true;
            checkForCompletion();
        });

        stream.on('error', reject);
    });
}

async function processStreamInConcurrentBatches<T>(
    stream: Stream, 
    batchSize: number, 
    maxWorkers: number, 
    processOne: (data: T) => Promise<any>
): Promise<number> {
    const batchedStream = batchStream(stream, batchSize);

    const processBatch = (batch: T[]) => {
        const promises = batch.map(processOne);
        return Promise.all(promises);
    };

    return processStreamConcurrently(batchedStream, maxWorkers, async (data: T | T[]) => {
        return processBatch(Array.isArray(data) ? data : [data]);
    });
}

export const streamUtils = {
    batchStream,
    processStream,
    processStreamInBatches,
    processStreamConcurrently,
    processStreamInConcurrentBatches,
};
