import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from "../../component/styles.js";

import '/component/bunny-button.js'
import '/component/bunny-box.js'

class DeathDialog extends HTMLElement {

    static get is() {
        return 'death-dialog';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        this.quotes = [{
            title: 'The Reaper',
            text: 'I, have come for you, ${player.name}, yet again.',
            response: '< roll your eyes >'
        }];

        fetch('data/death.json')
            .then(response => response.json())
            .then(json => {
                this.quotes = json;
            });

        application.subscribe('player-death', (callback) => {
            input.block();
            this.quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
            this.callback = callback;
            this._show();
        });
    }

    _parse(text) {
        let player = game.player;
        return eval("`" + text + "`");
    }

    _show() {
        this.render();
        this.container.style.display = 'block';
    }

    _accepted() {
        this.container.style.display = 'none';
        this.callback();
    }

    get template() {
        return html`
        <style>
            :host {
            }

            #dialog {
                min-width: 428px;
                max-width: 428px;
            }

            span {
                padding: 0.28rem;
            }

            .dialog-header {
                margin-top: 8px;
                padding-left: 16px;
                display: block;
                color: var(--paper-grey-300);
            }

            .dialog-text {
                display: block;
                padding-left: 16px;
                height: 76px;
                font-size: small;
                color: var(--paper-grey-300);
            }
            
            ${BunnyStyles.dialogs}
            ${BunnyStyles.noselect}
        </style>

        <div class="dialog-container" id="container" style="display: none;">
            <div class="dialog-overlay"></div>
            <bunny-box class="noselect dialog-center" id="dialog">
                <span class="dialog-header">${this._parse(this.quote.title)}</span>
                <span class="dialog-text">${this._parse(this.quote.text)}</span>

                <!-- show stats/damage sources here. -->

                <bunny-button raised class="primary" @click="${this._accepted.bind(this)}">${this._parse(this.quote.response)}</bunny-button>
            </bunny-box>
        </div>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
        this.container = this.query('#container');
    }
}

customElements.define(DeathDialog.is, DeathDialog);