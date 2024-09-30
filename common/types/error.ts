interface ErrorInterface {
    description: string;
    code?: number; // HTTP status code
    error?: string; // Unmanaged error message
}

export class ErrorCode extends Error {
    code: number;
    description: string;
    error?: string;

    constructor(error: ErrorInterface) {
        super(error.description);
        this.code = error.code || 500;
        this.description = error.description;
        this.error = error.error;
    }
}

export class SystemErrorCodes {
    static readonly INVALID_REQUEST = { code: 400, description: 'Invalid request' } as ErrorInterface;
    static readonly UNAUTHORIZED = { code: 401, description: 'Unauthorized' } as ErrorInterface;
    static readonly FORBIDDEN = { code: 403, description: 'Forbidden' } as ErrorInterface;
    static readonly NOT_FOUND = { code: 404, description: 'Not found' } as ErrorInterface;
    static readonly INTERNAL_SERVER_ERROR = { code: 500, description: 'Internal server error' } as ErrorInterface;
    static readonly SERVICE_UNAVAILABLE = { code: 503, description: 'Service unavailable' } as ErrorInterface;
    static readonly GATEWAY_TIMEOUT = { code: 504, description: 'Gateway timeout' } as ErrorInterface;
    static readonly NETWORK_ERROR = { code: 599, description: 'Network error' } as ErrorInterface;
}

export class ErrorCodes {
    static readonly InvalidXXX = { code: 400, description: 'Invalid XXX' } as ErrorInterface;
}