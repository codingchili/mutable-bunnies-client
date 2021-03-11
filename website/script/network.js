/**
 * handles network communication with backend api's using REST.
 */
class Network {

    constructor(service) {
        this.remote = '/';
        this.port = 1448; // default api port.
        this.service = service;
        this.host = window.location.hostname
        this.protocol = '//';
    }

    setHost(host) {
        this.host = host || window.location.hostname;
        return this;
    }

    setPort(port) {
        this.port = port;
        return this;
    }

    setProtocol(protocol) {
        this.protocol = protocol;
        return this;
    }

    ping(callback) {
        this.rest(callback, 'ping', {});
    }

    rest(callback, route, json) {
        let url = `${this.protocol}${this.host}:${this.port}${this.remote}`;
        json = json ?? {};
        json.target = this.service;
        json.route = route;

        fetch(url, {
            method: 'POST',
            body: JSON.stringify(json),
            headers: new Headers({'Content-Type': 'application/json'})
        })
            .then(response => response.json())
            .then(data => {
                if (callback.any) {
                    callback.any(data);
                } else {
                    this.handleResponse(data, callback);
                }
            }).catch(err => {
            throw err;
        });
    }

    handleResponse(data, callback) {
        // general error handler.
        let error = () => {
            if (callback.error) {
                callback.error(data);
            } else {
                console.log('Unhandled protocol error: ' + JSON.stringify(data));
            }
        };

        switch (data.status) {
            case ResponseStatus.ACCEPTED:
                if (callback.accepted) {
                    callback.accepted(data);
                    return;
                }
                break;
            case ResponseStatus.BAD:
                if (callback.bad) {
                    callback.bad(data);
                    return;
                }
                break;
            case ResponseStatus.MISSING:
                if (callback.missing) {
                    callback.missing(data);
                    return;
                }
                break;
            case ResponseStatus.CONFLICT:
                if (callback.conflict) {
                    callback.conflict(data);
                    return;
                }
                break;
            case ResponseStatus.UNAUTHORIZED:
                if (callback.unauthorized) {
                    callback.unauthorized(data);
                    return;
                }
                break;
        }
        // no handler for error.
        error(data);
    }


    handleError(response, json, callback) {
        const error = {
            'message': 'Network error ' + JSON.stringify(response.status) + ' for message ' +
                JSON.stringify(json), 'status': ResponseStatus.ERROR
        };

        if (callback.failed) {
            callback.failed(error);
        } else {
            console.log('Unhandled network error: ' + JSON.stringify(error));
        }
    }
}

window.Network = Network;

window.ResponseStatus = {
    ACCEPTED: 'ACCEPTED',
    BAD: 'BAD',
    MISSING: 'MISSING',
    CONFLICT: 'CONFLICT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    ERROR: 'ERROR',
};