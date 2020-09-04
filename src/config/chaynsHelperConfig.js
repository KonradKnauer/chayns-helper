// eslint-disable-next-line import/no-cycle
import { errorHandlerConfig } from 'default-error-handler';
import logger from 'chayns-logger';
import { loggerConfig } from './chayns-logger';
import handleRequestErrors from './default-error-handler';
import { initLog } from '../functions/log';
import { ENVIRONMENT } from './environment';
import { TEXTSTRING_CONFIG } from '../textstring/TextStringMemo';
import { reduxConfig } from './react-redux';

/**
 * @typedef logger
 * @property {function} info
 * @property {function} warning
 * @property {function} error
 * @property {function} critical
 */
/**
 * Initialize the chaynsHelpers, call in index.js
 * @param {string} [textStringPrefix='']
 * @param {boolean} [live=false]
 * @param {function} [requestErrorHandler]
 * @param {logger} [logger=defaultLogger] - logger, preferably chayns-logger
 */
const initChaynsHelper = (
    {
        textStringPrefix = '',
        live = false,
        requestErrorHandler = handleRequestErrors,
        pLogger = logger,
        useSelector = () => {}
    }
) => {
    TEXTSTRING_CONFIG.PREFIX = textStringPrefix;
    ENVIRONMENT.PRODUCTION = live;
    errorHandlerConfig.getErrorHandler = () => requestErrorHandler;
    loggerConfig.getLogger = () => pLogger;
    reduxConfig.getSelector = () => useSelector;
    initLog(live);
};

export default initChaynsHelper;