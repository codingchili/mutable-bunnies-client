/**
 * Simplest event bus implementation.
 *
 * @type {Window.EventBus}
 */
window.EventBus = class EventBus {

    constructor() {
        this.handlers = {};
    }

    subscribe(event, callback) {
        if (this.handlers[event] == null)
            this.handlers[event] = [];

        this.handlers[event].push(callback);
    }

    publish(event, data) {
        if (application.development.logEvents) {
            console.log({
                timestamp: new Date().toISOString().split('T')[1],
                event: event,
                data: data
            });
        }

        if (this.handlers[event])
            for (let subscriber = 0; subscriber < this.handlers[event].length; subscriber++)
                this.handlers[event][subscriber](data);
    }
};