/**
 * A helper to extract the logger from chayns-logger and catch the error if that package is not installed
 */
export type LogObject = {
    message?: string,
    type?: number,
    section?: string,
    customNumber?: number,
    customText?: string,
    data?: {
        [key: string]: any
    },
};

export type ErrorObject = LogObject & {
    ex?: Error
};

export interface Logger {
    debug: (logObject: LogObject) => any
    info: (logObject: LogObject) => any
    warning: (logObject: ErrorObject, ex?: Error) => any
    error: (logObject: ErrorObject, ex?: Error) => any
    critical: (logObject: ErrorObject, ex?: Error) => any
}

const logPlaceholder = (logObject: LogObject | ErrorObject, error?: Error) => {
    console.error('[chayns-helper] Please install the chayns-logger package or supply a custom logger')
}
let logConfig: { logger: Logger } = {
    logger: {
        debug: logPlaceholder,
        info: logPlaceholder,
        warning: logPlaceholder,
        error: logPlaceholder,
        critical: logPlaceholder
    }
};
try {
    // eslint-disable-next-line global-require
    logConfig.logger = require('chayns-logger/lib/chaynsLogger.js');
} catch (e) { /* ignored */ }

export const setLogger = (logger: Logger) => {
    logConfig.logger = logger;
}

export default logConfig;
