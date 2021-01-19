import logConfig from '../../utils/requireChaynsLogger';

export const chaynsErrorCodeRegex = /^[a-zA-Z0-9_]+\/[a-zA-Z0-9/_]+$/;

/**
 * @param {Object} obj
 * @returns {boolean}
 */
export function isChaynsErrorObject(obj: object): boolean {
    return !!obj
           && chayns.utils.isObject(obj)
           && Object.hasOwnProperty.call(obj, 'displayMessage')
           && Object.hasOwnProperty.call(obj, 'errorCode')
           && Object.hasOwnProperty.call(obj, 'requestId')
           // @ts-expect-error
           && chayns.utils.isString(obj?.errorCode)
           // @ts-expect-error
           && chayns.utils.isString(obj?.displayMessage)
           // @ts-expect-error
           && chaynsErrorCodeRegex.test(obj.errorCode);
}

/**
 * @param {Promise|Response|Object} value
 * @returns {Promise<boolean>}
 */
export default async function isChaynsError(value: any): Promise<boolean> {
    try {
        if (value instanceof Response) {
            const response = value.clone();
            let obj: { [key: string]: any } = {};
            try {
                obj = await response.json();
            } catch (e) { /* ignored */ }
            return isChaynsErrorObject(obj);
        }
        if (chayns.utils.isPromise(value)) {
            const result = await Promise.resolve(value);
            return isChaynsError(result);
        }
        return isChaynsErrorObject(value);
    } catch (e) {
        logConfig.logger.warning({
            message: '[IsChaynsError] Failed to read value',
            data: {
                value
            }
        });
        return false;
    }
}
