import {useEffect, useMemo, useState} from 'react';
// @ts-ignore
import logger from 'chayns-logger';
import shallowEqual from '../functions/shallowEqual';
import WsClient, {WebsocketConditions} from '../other/WsClient';
import WebSocketClient from "../other/WsClient";


/**
 * tobit-websocket-client has some unhandled errors. They don't affect the user but generate error logs. Using these
 * with the provided logger middleware reduces the logLevel for those errors to "warning"
 * @type {string[]}
 */
export const wssLoggerIgnore = [
    'null is not an object (evaluating \'a.socket.close\')',
    'Failed to execute \'send\' on \'WebSocket\': Still in CONNECTING state.',
    'a.socket is null',
    'Cannot read property \'close\' of null',
    'Unable to get property \'close\' of undefined or null reference'
];

/**
 * middleware to ignore unnecessary tobit-websocket-client error logs.
 * Add this in your chaynsLogger.init()
 * @param payload
 */
export const wssLoggerIgnoreMiddleware = (payload: any) => {
    const {message, ex} = payload;
    if ((message && wssLoggerIgnore.some((e) => (e.includes(message))))
        || (ex && ex.message && wssLoggerIgnore.some((e) => (e.includes(ex.message))))) {
        // eslint-disable-next-line no-param-reassign
        payload.level = 'Warning';
    }
};

/**
 * @type {Object.<string, WebSocketClient>}
 */
const websocketClients: {[serviceName: string]: WebSocketClient} = {};

/**
 * @callback wsEventHandler
 * @param {Object|*} data
 * @param {MessageEvent} wsEvent
 */

export interface WebsocketServiceConfig {
    serviceName: string
    conditions: WebsocketConditions
    /**
     * Format: { [eventName1]: eventListener1, [eventName2]: eventListener2 }
     */
    events: { [topic: string]: (data: any) => any }
    /**
     * services of the same client group share a ws connection and their conditions
     */
    clientGroup?: string
    /**
     * only init the service once all conditions are no longer undefined
     * default: true
     */
    waitForDefinedConditions?: boolean
    /**
     * default: true
     */
    disconnectOnUnmount?: boolean,
    /**
     * don't use any existing client from other hooks. required for wallet items to work properly
     * default: false
     */
    forceOwnConnection?: boolean
}

/**
 * Use a websocket client. Each service is only initialized once.
 */
const useWebsocketService = (
    config: WebsocketServiceConfig,
    deps?: any[]
): WebSocketClient|undefined => {
    const {
        serviceName,
        conditions,
        events,
        clientGroup = '',
        waitForDefinedConditions = true,
        disconnectOnUnmount = true,
        forceOwnConnection = chayns.env.site.tapp.id === 250357
    } = config || {};
    // events pattern: { [eventName1]: eventListener1, [eventName2]: eventListener2 }
    const [ownClient, setOwnClient] = useState<WebSocketClient>();
    const ownConnection = useMemo(() => forceOwnConnection, []);
    const group = useMemo(() => clientGroup, []);

    // register default events and update conditions
    useEffect(() => {
        if (waitForDefinedConditions
            && Object.values(conditions)
                .reduce((total, current) => total && current !== undefined, true)
        ) {
            const isInit = ownConnection ? !ownClient : !Object.prototype.hasOwnProperty.call(
                websocketClients,
                `${serviceName}_${group}`
            );

            let webSocketClient: WebSocketClient;

            if (isInit) {
                webSocketClient = new WsClient(
                    serviceName,
                    {...conditions}
                );
                if (ownConnection) {
                    setOwnClient(webSocketClient);
                } else {
                    websocketClients[`${serviceName}_${group}`] = webSocketClient;
                }
            } else {
                webSocketClient = <WebSocketClient>(ownConnection ? ownClient : websocketClients[`${serviceName}_${group}`]);
            }

            if (!shallowEqual(webSocketClient.conditions, {...webSocketClient.conditions, ...conditions})) {
                webSocketClient.updateConditions({...webSocketClient.conditions, ...conditions});
            }

            if (isInit) {
                // WS client default: WS registered successfully
                webSocketClient.on('registered', (data) => {
                    if (process.env.NODE_ENV === 'development') {
                        // eslint-disable-next-line no-console
                        console.log(
                            '[Websocket] client registered',
                            {serviceName, conditions, clientGroup}
                        );
                    }
                    logger.info({
                        message: '[Websocket] client registered',
                        data: {
                            data,
                            conditions,
                            serviceName,
                            clientGroup
                        }
                    });
                });

                // WS client default: WS register error (e.g. WSS webhook didn't work out)
                webSocketClient.on('register_error', (data) => {
                    // eslint-disable-next-line no-console
                    console.error('[Websocket] register error', data);
                    logger.error({message: '[Websocket] registration failed'}, data);
                });

                // WS client default: WS connection closed
                webSocketClient.on('CLOSED', (data) => {
                    // eslint-disable-next-line no-console
                    if (process.env.NODE_ENV === 'development') console.log('[Websocket] closed', data);
                    logger.info({
                        message: '[Websocket] connection closed',
                        data
                    });
                });

                // WS client default: WS connection error
                webSocketClient.on('ERROR', (error) => {
                    // eslint-disable-next-line no-console
                    console.error('[Websocket] error', error);
                    logger.warning({message: '[Websocket] error'}, error);
                });
            }
        }
        return disconnectOnUnmount || ownConnection ? () => {
            const webSocketClient = ownConnection ? ownClient : websocketClients[`${serviceName}_${group}`];
            if (webSocketClient) {
                webSocketClient.closeConnection();
            }
            if (!ownConnection) {
                delete websocketClients[`${serviceName}_${group}`];
            }
        } : () => {
        };
    }, [ownConnection ? null : !!websocketClients[`${serviceName}_${group}`], ...Object.values(conditions)]);

    // register custom events
    useEffect(() => {
        const webSocketClient = ownConnection ? ownClient : websocketClients[`${serviceName}_${group}`];
        if (webSocketClient) {
            const eventKeys = Object.keys(events);

            for (let i = 0; i < eventKeys.length; i += 1) {
                if (chayns.utils.isString(eventKeys[i]) && chayns.utils.isFunction(events[eventKeys[i]])) {
                    webSocketClient.on(eventKeys[i], events[eventKeys[i]]);
                }
            }

            return () => {
                for (let i = 0; i < eventKeys.length; i += 1) {
                    if (chayns.utils.isString(eventKeys[i]) && chayns.utils.isFunction(events[eventKeys[i]])) {
                        webSocketClient.off(eventKeys[i]);
                    }
                }
            };
        }
        return () => {
        };
    }, [...(deps || []), ownConnection ? ownClient : websocketClients[`${serviceName}_${group}`]]);

    return ownConnection ? ownClient : websocketClients[`${serviceName}_${group}`];
};

export default useWebsocketService;