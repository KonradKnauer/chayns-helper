export type WebsocketConditions = { [key: string]: string | number | boolean };

/**
 * This websocket client works exactly like the tobit-websocket-service-client but has additional null value handling
 * and additional precautions to prevent duplicate connections
 */
class WebSocketClient {
    private readonly reconnectTimeoutTime: number;

    private readonly checkConnectionIntervalTime: number;

    private readonly application: string | null = null;

    conditions: WebsocketConditions | null = null;

    private socket: WebSocket | null = null;

    private checkConnectionInterval: NodeJS.Timeout | null = null;

    private reconnectTimeout: NodeJS.Timeout | null = null;

    private answeredPing = false;

    private readonly listener: { [event: string]: (...args: any[]) => any } = {};

    private shouldReconnect = true;

    public connections: number = 0;

    constructor(
        application: string,
        conditions: WebsocketConditions,
        options: {
            reconnectTimeout?: number,
            checkConnectionInterval?: number
        } = {}
    ) {
        this.application = application;
        this.conditions = conditions;

        this.reconnectTimeoutTime = options.reconnectTimeout || 5000;
        this.checkConnectionIntervalTime = options.checkConnectionInterval || 2000;

        this.createConnection();
    }

    /**
     * @private
     */
    private onOpen = () => {
        clearTimeout(<NodeJS.Timeout>this.reconnectTimeout);

        this.send('register', {
            application: this.application,
            conditions: this.conditions,
        });

        this.answeredPing = true;
        clearInterval(<NodeJS.Timeout>this.checkConnectionInterval);
        this.checkConnectionInterval = setInterval(this.checkConnection, this.checkConnectionIntervalTime);

        this.emit('OPEN');
    };

    /**
     * @private
     */
    private onMessage = (e: MessageEvent) => {
        const message = JSON.parse(e.data);

        if (message.topic === 'pong') {
            this.answeredPing = true;
            return;
        }

        this.emit(message.topic, message.data, e);
    };

    /**
     * @private
     */
    private onError = (err?: Event) => {
        this.emit('ERROR', err, err);
    };

    /**
     * @private
     */
    private onClose = (event?: CloseEvent) => {
        clearInterval(<NodeJS.Timeout>this.checkConnectionInterval);
        if (this.socket) {
            this.socket.onopen = () => {
            };
            this.socket.onerror = () => {
            };
            this.socket.onclose = () => {
            };
            this.socket.onmessage = () => {
            };
        }
        this.socket = null;
        clearTimeout(<NodeJS.Timeout>this.reconnectTimeout);
        if (this.shouldReconnect) this.reconnectTimeout = setTimeout(this.createConnection, this.reconnectTimeoutTime);

        this.emit('CLOSED', event, event);
    };

    /**
     * @private
     */
    private checkConnection = () => {
        if (!this.answeredPing) {
            if (this.socket && this.socket?.close) {
                this.socket?.close();
            } else {
                this.onClose();
            }
            return;
        }

        this.send('ping');
        this.answeredPing = false;
    };

    private send = (topic: string, data?: any) => {
        if (this.socket
            && this.socket?.readyState === WebSocket.OPEN
            && this.socket?.readyState !== WebSocket.CONNECTING) {
            this.socket?.send(JSON.stringify({
                topic,
                data
            }));
        }
    };

    private createConnection = () => {
        if (this.socket) {
            this.socket.onopen = () => {
            };
            this.socket.onerror = () => {
            };
            this.socket.onclose = () => {
            };
            this.socket.onmessage = () => {
            };
            this.socket.close();
        }
        this.socket = new WebSocket('wss://websocket.tobit.com');

        this.socket.onopen = this.onOpen;
        this.socket.onerror = this.onError;
        this.socket.onclose = this.onClose;
        this.socket.onmessage = this.onMessage;
    };

    private emit = (event: string, data?: any, wsEvent: Event | null = null) => {
        if (typeof this.listener[event] === 'function') {
            this.listener[event](data, wsEvent);
        }
    };

    /**
     * Registers a new event handler for the given event name.
     * Overrides any previous event handler for this event.
     */
    public on = (event: string, listener: (data: { [key: string]: number | string | null }, wsEvent: MessageEvent) => any) => {
        this.listener[event] = listener;
    };

    public off = (event: string) => {
        this.listener[event] = () => {
        };
    };

    /**
     * Registers a new event handler that is called once for the given event name.
     */
    public once = (
        event: string,
        listener: (data: { [key: string]: number | string | null }, wsEvent: MessageEvent) => any
    ) => {
        this.listener[event] = (data, wsEvent) => {
            listener(data, wsEvent);
            this.listener[event] = () => {
            };
        };
    };

    /**
     * Updates the conditions.
     * @param {Object} conditions
     */
    public updateConditions = (conditions: WebsocketConditions) => {
        this.conditions = conditions;
        this.send('register', {
            application: this.application,
            conditions: this.conditions,
        });
    };

    /**
     * Close websocket connection.
     */
    public closeConnection = () => {
        this.shouldReconnect = false;
        if (this?.socket && this?.socket?.close) {
            this?.socket?.close();
        } else {
            this.onClose();
        }
    };
}

export default WebSocketClient;
