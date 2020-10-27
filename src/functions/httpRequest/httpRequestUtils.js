import logger from 'chayns-logger';
import colorLog from '../../_internal/colorLog';
import stringToRegex from '../../_internal/stringToRegex';
import LogLevel from './LogLevel';
import RequestError from './RequestError';
import ResponseType from './ResponseType';

export const getMapKeys = (map) => {
    const result = [];
    const keys = map.keys();
    for (let i = 0; i < map.size; i++) {
        const { value } = keys.next();
        result.push(value);
    }
    return result;
};

export function getLogFunctionByStatus(status, logConfig, defaultFunction) {
    const levelKey = getMapKeys(logConfig)
        .find((key) => (/^-?[\d]$/.test(key) && parseInt(key, 10) === status)
            || stringToRegex(key).test(status));
    if (levelKey && logConfig.get(levelKey)) {
        switch (logConfig.get(levelKey)) {
            case LogLevel.info:
                return logger.info;
            case LogLevel.warning:
                return logger.warning;
            case LogLevel.error:
                return logger.error;
            case LogLevel.critical:
                return logger.critical;
            case LogLevel.none:
                // eslint-disable-next-line no-console
                return console.warn;
            default:
                console.error(...colorLog({
                    '[HttpRequest]': 'color: #aaaaaa',
                    // eslint-disable-next-line max-len
                    [`LogLevel '${logConfig.get(levelKey)}' for '${levelKey}' is not valid. Please use a valid log level.`]: ''
                }));
                return defaultFunction;
        }
    }
    return defaultFunction;
}

/**
 * @param status
 * @param statusHandlers
 * @returns {function(*=)|ResponseType|null}
 */
export function getStatusHandlerByStatusRegex(status, statusHandlers) {
    const keys = getMapKeys(statusHandlers);
    for (let i = 0; i < keys.length; i += 1) {
        const regExp = stringToRegex(keys[i]);
        if (regExp.test(status?.toString())
            && (chayns.utils.isFunction(statusHandlers.get(keys[i]))
                || Object.values(ResponseType).includes(statusHandlers.get(keys[i])))
        ) {
            return statusHandlers.get(keys[i]);
        }
    }
    return null;
}

/**
 * @param response
 * @param processName
 * @param resolve
 * @param useFetchApi
 * @param internalRequestGuid
 * @returns {Promise<void>}
 */
export const jsonResolve = async (response, processName, resolve, useFetchApi, internalRequestGuid = null) => {
    const { status } = response;
    try {
        resolve(useFetchApi ? await response.json() : JSON.parse(response.response));
    } catch (err) {
        logger.warning({
            message: `[HttpRequest] Getting JSON body failed on Status ${status} on ${processName}`,
            data: {
                internalRequestGuid
            }
        }, err);
        // eslint-disable-next-line no-console
        console.warn(...colorLog({
            '[HttpRequest]': 'color: #aaaaaa',
            // eslint-disable-next-line max-len
            [`Getting JSON body failed on Status ${status} on ${processName}. If this is expected behavior, consider adding a statusHandler in your request options for this case:`]: ''
        }), { statusHandlers: { [status]: ResponseType.None } }, '\n', err);
        resolve(null);
    }
};

/**
 * @param response
 * @param processName
 * @param resolve
 * @param useFetchApi
 * @param internalRequestGuid
 * @returns {Promise<void>}
 */
export const blobResolve = async (response, processName, resolve, useFetchApi, internalRequestGuid = null) => {
    const { status } = response;
    try {
        resolve(useFetchApi ? await response.blob() : new Blob(response.response));
    } catch (err) {
        logger.warning({
            message: `[HttpRequest] Getting BLOB body failed on Status ${status} on ${processName}`,
            data: {
                internalRequestGuid
            }
        }, err);
        // eslint-disable-next-line no-console
        console.warn(...colorLog({
            '[HttpRequest]': 'color: #aaaaaa',
            // eslint-disable-next-line max-len
            [`Getting BLOB body failed on Status ${status} on ${processName}. If this is expected behavior, consider adding a statusHandler in your request options for this case:`]: ''
        }), { statusHandlers: { [status]: ResponseType.None } }, '\n', err);
        resolve(null);
    }
};

/**
 * @param response
 * @param processName
 * @param resolve
 * @param useFetchApi
 * @param internalRequestGuid
 * @returns {Promise<void>}
 */
export const textResolve = async (response, processName, resolve, useFetchApi, internalRequestGuid = null) => {
    const { status } = response;
    try {
        resolve(useFetchApi ? await response.text() : response.response);
    } catch (err) {
        logger.warning({
            message: `[HttpRequest] Getting text body failed on Status ${status} on ${processName}`,
            data: { internalRequestGuid }
        }, err);
        // eslint-disable-next-line no-console
        console.warn(...colorLog({
            '[HttpRequest]': 'color: #aaaaaa',
            // eslint-disable-next-line max-len
            [`Getting text body failed on Status ${status} on ${processName}. If this is expected behavior, consider adding a statusHandler in your request options for this case:`]: ''
        }), { statusHandlers: { [status]: ResponseType.None } }, '\n', err);
        resolve(null);
    }
};

/**
 * @param response
 * @param processName
 * @param resolve
 * @param useFetchApi
 * @param internalRequestGuid
 * @returns {Promise<void>}
 */
export const objectResolve = async (response, processName, resolve, useFetchApi, internalRequestGuid = null) => {
    const { status } = response;
    try {
        resolve({ status, data: useFetchApi ? await response.json() : JSON.parse(response.response) });
    } catch (err) {
        logger.warning({
            message: `[HttpRequest] Getting JSON body for Object failed on Status ${status} on ${processName}`,
            data: { internalRequestGuid }
        }, err);
        // eslint-disable-next-line no-console
        console.warn(...colorLog({
            '[HttpRequest]': 'color: #aaaaaa',
            // eslint-disable-next-line max-len
            [`Getting JSON body for Object failed on Status ${status} on ${processName}. If this is expected behavior, consider adding a statusHandler in your request options for this case:`]: ''
        }), { statusHandlers: { [status]: ResponseType.None } }, '\n', err);
        resolve({ status, data: null });
    }
};

export const mergeOptions = (obj1, obj2) => {
    const result = new Map();
    const keys1 = Object.keys(obj1);
    for (let i = 0; i < keys1.length; i++) {
        result.set(keys1[i], obj1[keys1[i]]);
    }
    const keys2 = Object.keys(obj2);
    for (let i = 0; i < keys2.length; i++) {
        if (!result.get(keys2[i])) {
            result.set(keys2[i], obj2[keys2[i]]);
        }
    }
    return result;
};
