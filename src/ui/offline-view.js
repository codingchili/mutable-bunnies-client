import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/component/bunny-box.js'
import '/component/bunny-spinner.js'

class OfflineView extends HTMLElement {

    static get is() {
        return 'offline-view';
    }

    constructor() {
        super();
        this.connecting = false;

        application.subscribe('view', view => {
            if (view === 'offline-view') {
                this.timer = setInterval(() => {
                    this.connecting = true;
                    this.render();

                    fetch('/')
                        .then((response) => {
                            send_message_to_sw("offline?").then(response => {
                                if (response.offline) {
                                    this.stop();
                                } else {
                                    application.showLogin();
                                }
                            });
                        }).catch((e) => {
                            this.stop();
                    });
                }, 5000);
            } else {
                if (this.timer) {
                    window.clearInterval(this.timer);
                }
            }
        });
    }

    stop() {
        setTimeout(() => {
            this.connecting = false;
            this.render();
        }, 1350);
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
        this.render();
    }

    get template() {
        return html`
        <style>
            :host {
                display: block;
                padding-top: 326px;
            }

            .container {
                display: block;
                margin: auto;
                width: 525px;
                min-width: 326px;
                height: 256px;
            }

            .title {
                text-align: center;
                padding-top: 16px;
            }

            .text {
                padding: 64px;
                text-align: center;
            }

            @media (max-width: 728px) {
                :host {
                    padding-top: 36px;
                }

                .container {
                    width: 100%;
                }
            }

        </style>

        <bunny-box class="container" id="container">
            <div class="title">
                <h4>Server offline</h4>
            </div>

            <bunny-spinner class="loader" text="Connecting.." ?enabled="${this.connecting}"></bunny-spinner>

            <div class="text" ?hidden="${this.connecting}">
                No connection available, we'll retry soon!
            </div>
        </bunny-box>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(OfflineView.is, OfflineView);