import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from "../../component/styles.js";

import '/component/bunny-box.js'
import '/component/bunny-icon.js'

class GameDialog extends HTMLElement {

    static get is() {
        return 'game-dialog';
    }

    constructor() {
        super();
        this.player = {};
        this.entity = '';
        this.text = '';
        this.lines = [];

        application.onCharacterLoaded(character => {
            this.player = character;
        });

        application.onDialogEvent(dialog => {
            // call update instead of start.
            input.block();
            this._update(dialog);
        });
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
        this.render();
    }

    _update(dialog) {
        if (dialog.end && !dialog.text) {
            this._stop();
        } else {
            this.entity = game.lookup(dialog.targetId).name;
            this.text = this._parse(dialog.text);

            this.lines = dialog.lines;

            if (dialog.target) {
                this.target = game.lookup(this.target);
            }

            this.container.style.display = 'block';
            this.render();
        }
    }

    _parse(text) {
        let player = this.player;
        let target = this.target;
        return eval("`" + text + "`");
    }

    _stop() {
        this.container.style.display = 'none';
        game.dialogs.end();
        input.unblock();
    }

    _select(line) {
        game.dialogs.say(line.id);
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
            
            ${BunnyStyles.dialogs}
            ${BunnyStyles.variables}
            ${BunnyStyles.noselect}
            ${BunnyStyles.icons}

            .dialog-text {
                display: block;
                padding-left: 16px;
                height: 76px;
                font-size: small;
                color: var(--paper-grey-300);
            }

            .dialog-option {
                display: block;
                font-size: small;
            }

            .dialog-option:hover {
                cursor: var(--bunny-cursor-pointer);
                color: var(--player-class-theme);
            }

            .dialog-option-list {
                list-style-type: none;
            }
        </style>

        <div class="dialog-container noselect" id="container" style="display: none;">
            <div class="dialog-overlay"></div>
            <bunny-box id="dialog" class="dialog-center" border>
                <bunny-icon class="icon" icon="close" id="dialog-close" @mousedown="${this._stop.bind(this)}"></bunny-icon>

                <span class="dialog-entity">${this.entity}</span>
                <span class="dialog-text">${this.text}</span>

                <ul class="dialog-option-list">
                    ${this.lines.map(line => 
                        html`<li><span class="dialog-option" @mousedown="${this._select.bind(this, line)}">${this._parse(line.text)}</span></li>`
                    )}
                </ul>
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

customElements.define(GameDialog.is, GameDialog);