import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from "../component/styles.js";
import '/component/bunny-button.js'
import '/component/bunny-box.js'
import '/component/bunny-spinner.js'
import '/component/bunny-icon.js'

class ErrorDialog extends HTMLElement {

    static get is() {
        return 'error-dialog';
    }

    connectedCallback() {
        this.opened = false;
        this.action = "reconnecting";
        this.text = '';

        application.onError((error) => {
            this.open(error);
        });

        this.attachShadow({mode: 'open'})
    }

    get template() {
        return html`
        <style>
            ${BunnyStyles.variables}
            ${BunnyStyles.icons}
        
            :host {
                display: ${this.opened ? 'inline-block' : 'none'};
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                transition: background-color 1s;
                background-color: var(--backdrop-color);
            }
            
            .visible {
                background-color: var(--backdrop-color);
            }

            .buttons {
                /*padding: 32px 0 0 0;
                position: absolute;
                bottom: 0;
                right: 0;
                left: 0;*/
                margin-top: 16px;
            }

            .box {
                width: 100%;
                max-width: 375px;
                height: fit-content;
                margin: auto;
                position: relative;
                top: 50%;
                transform: translateY(-50%);
            }

            .error-icon {
                width: 96px;
                left: 86px;
                height: 96px;
                pointer-events: none;
            }

            .error-text {
                margin: 32px 32px 32px;
                display: block;
                text-align:center;
            }
            
            bunny-spinner {
                margin-bottom: -32px;
            }
            
            .icon {
                width: 64px;
                height: 64px;
                display: block;
                margin: auto;
                margin-top: 64px;
            }

            .tooltip {
                width: 80%;
                margin: auto;
            }

        </style>


        <bunny-box id="dialog" class="box" solid>
            <bunny-spinner text="retrying.. " ?enabled="${this.loading}"></bunny-spinner>
            
            ${this.loading ? '' : html`<bunny-icon class="icon" icon="error"></bunny-icon>`}
    
                <div class="error-text scrollable" style="display: ${this.text ? 'block' : 'none'};">
                ${this.text}
            </div>

            <div class="buttons">
                <bunny-button primary @click="${this.close.bind(this)}">close</bunny-button>
            </div>
        </bunny-box>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    open(error) {
        if (error) {
            this.loading = error.retrying;
            this.text = error.text;
            this.callback = error.callback;

            if (!this.loading && !this.text) {
                this.text = 'No error message specified.';
            }

            this.opened = true;
            this.classList.add('visible');
            this.render();
        } else {
            this.opened = false;
            this.render();
        }
    }

    close() {
        this.opened = false;
        this.classList.remove('visible');
        this.render();

        if (this.callback) {
            this.callback();
        }
    }
}

customElements.define(ErrorDialog.is, ErrorDialog);