import axios, { Method, AxiosRequestConfig } from 'axios';
import { streamUtils } from '../util/batchUtil';
import { config } from '../config/config';

interface SettlementClientConfig {
    url: string;
}

class SettlementClient {
    url: string;
    activeRequests: number = 0;

    constructor(config: SettlementClientConfig) {
        this.url = config.url;
    }

    async sendRequest(functionName: string, params: Record<string, any>): Promise<any> {
        const url = `${this.url}/${functionName}`;
        const requestOptions: AxiosRequestConfig = {
            method: 'POST' as Method,
            url,
            data: params,
            timeout: 120000, // 2 minutes timeout
        };

        try {
            const response = await axios(requestOptions);
            return response.data;
        } catch (error: any) {
            throw new Error(`Error sending request to ${functionName}: ${error.message}`);
        }
    }
}

type SettlementBalancerConfig = {
    maximumRequestPerClient: number;
    requestTimeout?: number;
};

export class SettlementBalancer {
    private readonly clients: SettlementClient[] = [];
    private readonly config: SettlementBalancerConfig;

    constructor(config: Partial<SettlementBalancerConfig> = {}) {
        this.config = {
            maximumRequestPerClient: 10,
            requestTimeout: 120000, // Default timeout
            ...config,
        };
    }

    async initConns(): Promise<void> {
        const settlementProcessCount = config.settlement.processes;
        const settlementUrl = config.settlement.url;

        for (let i = 0; i < settlementProcessCount; i++) {
            this.clients.push(new SettlementClient({ url: settlementUrl }));
        }
    }

    async request(functionName: string, params: Record<string, any>): Promise<any> {
        const client = this.getRandomClient();
        return client.sendRequest(functionName, params);
    }

    private getRandomClient(): SettlementClient {
        return this.clients[Math.floor(Math.random() * this.clients.length)];
    }

    async pipeStreamTo(
        stream: NodeJS.ReadableStream,
        prepareRequest: (data: any, request: (functionName: string, params: Record<string, any>) => Promise<void>) => void,
        processResponse?: (data: any) => Promise<void>,
        isAwait: boolean = false
    ): Promise<void> {
        let readyClients = this.clients.slice();
        let totalActiveRequests = 0;
        let streamEnded = false;

        const resetClients = () => {
            readyClients.forEach(client => {
                client.activeRequests = 0;
            });
        };
        resetClients();

        return new Promise<void>((resolve, reject) => {
            const onData = async (data: any) => {
                const client = this.selectClient(readyClients, stream);
                prepareRequest(data, async (functionName, params) => {
                    await this.sendClientRequest(client, functionName, params, stream, processResponse, reject, isAwait);
                });
            };

            const onEnd = () => {
                streamEnded = true;
                if (totalActiveRequests === 0) resolve();
            };

            const onError = (err: any) => reject(err);

            stream.on('data', onData);
            stream.on('end', onEnd);
            stream.on('error', onError);
        });
    }

    private selectClient(readyClients: SettlementClient[], stream: NodeJS.ReadableStream): SettlementClient {
        if (readyClients.length === 0) {
            throw new Error('No idle clients. Stream should have been paused.');
        }

        const client = readyClients.pop()!;
        client.activeRequests++;

        if (client.activeRequests < this.config.maximumRequestPerClient) {
            readyClients.unshift(client);
        }

        if (readyClients.length === 0) {
            stream.pause();
        }

        return client;
    }

    private async sendClientRequest(
        client: SettlementClient,
        functionName: string,
        params: Record<string, any>,
        stream: NodeJS.ReadableStream,
        processResponse?: (data: any) => Promise<void>,
        reject?: (err: any) => void,
        isAwait: boolean = false
    ): Promise<void> {
        try {
            const responseData = await client.sendRequest(functionName, params);

            if (isAwait) {
                stream.pause(); // Pause the stream if `isAwait` is true
            }

            if (processResponse) {
                await processResponse(responseData);
            }

            this.onRequestComplete(client, stream, isAwait);
        } catch (error: any) {
            reject?.(new Error(`Error sending client request: ${error.message}`));
        }
    }

    private onRequestComplete(client: SettlementClient, stream: NodeJS.ReadableStream, isAwait: boolean): void {
        client.activeRequests--;

        if (isAwait) {
            stream.resume(); // Resume the stream after processing response
        } else if (client.activeRequests < this.config.maximumRequestPerClient) {
            stream.resume();
        }
    }

    async processStream(options: {
        batchSize: number;
        stream: NodeJS.ReadableStream;
        isAwait?: boolean;
        makeRequest: (data: any, request: (functionName: string, params: Record<string, any>) => Promise<void>) => void;
        processResponse?: (data: any) => Promise<void>;
    }): Promise<void> {
        const stream = options.batchSize
            ? streamUtils.batchStream(options.stream as any, options.batchSize)
            : options.stream;

        return this.pipeStreamTo(
            stream as any,
            options.makeRequest,
            options.processResponse,
            options.isAwait ?? false
        );
    }

    close(): void {
        // Cleanup resources if necessary
    }
}
