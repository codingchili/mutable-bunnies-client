function send_message_to_sw(msg) {
    return new Promise((resolve, reject) => {
        let channel = new MessageChannel();

        channel.port1.onmessage = (event) => {
            if (event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data);
            }
        };
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(msg, [channel.port2]);
        } else {
            // failed to retrieve controller, assume online.
            resolve({
                offline: false
            });
        }
    });
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service_worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, (err) => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });

    navigator.serviceWorker.ready.then(() => {
        send_message_to_sw("is offline?").then(event => {
            application.offline = event.offline;
            application.publish('offline', application.offline);

            if (application.offline) {
                application.view("offline-view");
            }
        });
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.pwa = e;
    application.publish('installed', !window.pwa);
});

window.isPWA = (window.matchMedia('(display-mode: fullscreen)').matches)
    || (window.matchMedia('(display-mode: standalone)').matches);

application.onAuthentication(() => {
    if (window.isPWA || application.settings.fullscreen) {
        document.documentElement.requestFullscreen()
            .catch((e) => {
                console.log(e);
            });
    }
});
