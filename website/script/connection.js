/**
 * handles network communication for websockets.
 */
const PING_INTERVAL = 8000;
const PING_CHECK = 1000;

class Connection {

    constructor(realm) {
        this.realm = realm;
        this.clientClosed = false;
        this.binaryWebsocket = true;
        this.port = realm.port;
        this.host = realm.host || window.location.hostname;
        this.binaryWebsocket = realm.binaryWebsocket;
        this.handlers = {};
        this.onConnectHandlers = [];
        this.protocol = (realm.secure) ? "wss://" : "ws://";

        this.connect();
    }

    connect() {
        return new Promise(((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.protocol + this.host + ":" + this.port + "/");
                this.ws.binaryType = 'arraybuffer';
            } catch (e) {
                reject();
                return;
            }

            this.decoder = new TextDecoder("UTF-8");
            this.ws.onmessage = (event) => {
                let data = (this.binaryWebsocket) ?
                    this.decoder.decode(event.data) :
                    event.data;

                this.onmessage(data);
            };
            this.ws.onopen = () => {
                application.recover();
                this.open = true;
                for (let i = 0; i < this.onConnectHandlers.length; i++) {
                    this.onConnectHandlers[i]();
                }
                this.onConnectHandlers = [];

                this.ping = setInterval(() => {
                    if (this.open && this.ws.readyState === this.ws.OPEN) {

                        // send a ping if no message received in the last PING_INTERVAL.
                        if (this.last < performance.now() - PING_INTERVAL) {
                            this.send('ping');
                        }

                    } else {
                        clearInterval(this.ping);
                    }
                }, PING_CHECK);

                resolve();
            };
            this.ws.onerror = (e) => {
                reject();
                this.onerror(e);
            };
            this.ws.onclose = (e) => {
                this.onclose(e);
            };
        }));
    }

    onmessage(data) {
        this.last = performance.now();

        data = JSON.parse(data);
        let route = data.route;

        if (this.handlers[route]) {
            if (data.status === ResponseStatus.ACCEPTED) {
                this.handlers[route].accepted(data);
            } else {
                this.handlers[route].error(data);
            }
        } else {
            console.log('no handler for message: ' + JSON.stringify(data));
        }
    }

    onConnected(connected) {
        this.onConnectHandlers.push(connected);
    }

    send(route, data, callback) {
        data = data || {};
        data.route = route;

        if (callback) {
            this.setHandler(route, callback);
        }

        if (this.open) {
            if (this.ws.readyState === this.ws.OPEN) {
                this.ws.send(JSON.stringify(data));
            } else {
                this.onerror();
            }
        } else {
            if (!this.clientClosed) {
                this.onConnected(() => this.send(route, data, callback));
            }
        }
    }

    close() {
        this.clientClosed = true;
        this.ws.close();
    }

    setHandler(route, callback) {
        if (!callback.accepted) {
            callback.accepted = (message) => callback(message);
        }
        if (!callback.error) {
            callback.error = (err) => application.onError(err.message);
        }
        this.handlers[route] = callback;
    }

    onerror(event) {
        this.open = false;
        this.close();
        this.disconnected(`Connection error to ${this.realm.name}.`);
    }

    onclose(event) {
        this.open = false;
        if (!this.clientClosed) {
            this.disconnected(`Connection to server ${this.realm.name} lost.`);
        }
    }

    disconnected(message) {
        application.error(message);
    }
}

window.Connection = Connection;