// @ts-expect-error
import logger from 'chayns-logger';
import { isChaynsErrorObject } from './isChaynsError';
import {ChaynsErrorObject} from "./ChaynsError";

function getChaynsErrorCodeFromObject(value: ChaynsErrorObject): string|null {
    if (!isChaynsErrorObject(value)) return null;
    if (chayns.utils.isObject(value) && Object.hasOwnProperty.call(value, 'errorCode')) {
        return value.errorCode;
    }
    return null;
}

/**
 * Get the chayns error code from a Response or errorObject
 * @param value
 * @returns
 */
export default async function getChaynsErrorCode(value: any): Promise<string|null> {
    try {
        if (value instanceof Response) {
            const response = value.clone();
            let obj: {[key: string]: any}|ChaynsErrorObject = {};
            try {
                obj = await response.json();
            } catch(e) { /* ignored */ }
            return getChaynsErrorCodeFromObject(<ChaynsErrorObject>obj);
        }
        if (chayns.utils.isPromise(value)) {
            const result = await Promise.resolve(value);
            return getChaynsErrorCode(result);
        }
        return getChaynsErrorCodeFromObject(value);
    } catch (e) {
        logger.warning({
            message: '[GetChaynsErrorCode] Failed to read value',
            data: {
                value
            }
        });
        return null;
    }
}
