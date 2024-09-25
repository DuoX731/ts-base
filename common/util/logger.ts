import { config } from '@common/config/config';
import chalk from 'chalk';

const ENV = config.environment;

const getTimeStamp = (): string => new Date().toISOString();

const colors = {
    log: chalk.green,
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.blue,
    debug: chalk.magenta,
    plain: chalk.whiteBright,
    env: (() => {
        switch (ENV) {
            case 'DEV':
                return chalk.green(ENV);
            case 'PROD':
                return chalk.red(ENV);
            case 'TEST':
                return chalk.yellow(ENV);
            default:
                return chalk.whiteBright(ENV);
        }
    })
}

type ConsoleMethod = 'log' | 'info' | 'warn' | 'error' | 'debug';

const logger = (logLevel: ConsoleMethod, message?: any, ...optionalParams: any[]): void => {
    console[logLevel](
        colors.log(`[${getTimeStamp()}]`), 
        `[${colors.env()}]`, 
        colors[logLevel](`[${logLevel.toLocaleUpperCase()}]`),
        message,
        ...optionalParams
    );
}

const log = (message?: any, ...optionalParams: any[]): void => logger('log', message, ...optionalParams);
const info = (message?: any, ...optionalParams: any[]): void => logger('info', message, ...optionalParams);
const warn = (message?: any, ...optionalParams: any[]): void => logger('warn', message, ...optionalParams);
const error = (message?: any, ...optionalParams: any[]): void => logger('error', message, ...optionalParams);
const debug = (message?: any, ...optionalParams: any[]): void => logger('debug', message, ...optionalParams);

export default {
    info,
    warn,
    error,
    debug,
    log
};