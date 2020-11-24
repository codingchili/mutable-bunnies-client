import {html, render} from '/node_modules/lit-html/lit-html.js';

import '/component/bunny-box.js';

class NotificationToaster extends HTMLElement {

    static get is() {
        return 'notification-toaster';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.subscribe('notification', (event) => {
            this.toastText = event.text || event;
            let duration = event.duration || this._durationFromText();
            this._open(duration);
        });

        this.render();
    }

    _durationFromText() {
        return 2250 + this.toastText.length * 24;
    }

    _open(duration) {
        this.toast = this.query('#toast');

        if (this.open) {
            clearInterval(this.timer);
        } else {
            this.toast.style.display = 'block';
            this.toast.classList.remove('hidden');
            this.toast.classList.add('visible');
            this.open = true;
        }

        this.timer = setTimeout(() => {
            this.toast.classList.remove('visible');
            this.toast.classList.add('hidden');
            setTimeout(() => {
                if (!this.open) {
                    this.toast.style.display = 'none';
                }
            }, 300);
            this.open = false;
        }, duration);

        this.render();
    }

    get template() {
        return html`
        <style>
            :host {
                display: block;
            }

            #toast {
                position: absolute;
                display: none;
                z-index: 900;

                top: 32px;
                max-width: 396px;
                left: 50%;
                transform: translateX(-50%);

                padding: 16px 24px;
                font-size: smaller;
            }

            .visible {
                animation: fade 0.3s ease 1;
                animation-direction: normal;
            }

            .hidden {
                opacity: 0;
                transition: opacity 0.3s;
            }

            @keyframes fade {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            span {
                white-space: pre-wrap;
            }
            
            .noselect {
                user-select: none;
            }
            
            .toast-text {
                padding: 12px;
                margin: 4px;
                display: block;
                font-size: medium;
            }

        </style>

        <bunny-box border id="toast" class="noselect">
            <span class="toast-text">${this.toastText}</span>
        </bunny-box>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(NotificationToaster.is, NotificationToaster);