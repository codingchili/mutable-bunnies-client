/**
 * Reports metric events to the server, note that events will not
 * be emitted if there is no authentication token available.
 *
 * The following information is collected;
 * - User agent, platform & vendor.
 * - Time to paint
 * - Display size
 * - Language
 * - Error messages
 */
class Metrics {

    constructor() {
        application.onError(this._error.bind(this));
        application.onAuthentication(this._report.bind(this));
    }

    _error(e) {
        this.send({
            event: 'error',
            agent: window.navigator.userAgent,
            vendor: window.navigator.vendor,
            error: e.text ?? e.message
        });
    }

    _report() {
        this._network = new Network('client.logging.node');
        let paint = performance.getEntriesByName('first-paint')[0].startTime;
        let content = performance.getEntriesByName('first-contentful-paint')[0].startTime;
        let {language, platform, userAgent, vendor} = window.navigator;
        let {outerHeight, outerWidth} = window;

        let message = {
            event: 'performance',
            paint: Math.trunc(paint),
            content: Math.trunc(content),
            vendor: vendor,
            agent: userAgent,
            language: language,
            platform: platform,
            outerHeight: outerHeight,
            outerWidth: outerWidth
        };
        this.send(message);
    }

    send(json) {
        if (this._network) {
            this._network.rest({
                accepted: () => console.log({reported: json})
            }, 'logging', {
                token: application.token,
                message: json
            });
        } else {
            console.log({
                error: 'failed to report, user might not be authorized yet.',
                message: json
            })
        }
    }
}

window.metrics = new Metrics();