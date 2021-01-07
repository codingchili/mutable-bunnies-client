import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js';

import {BunnyStyles} from "../../component/styles.js";

import '/component/bunny-box.js'
import '/component/bunny-icon.js'

class PlayerSpells extends HTMLElement {

    static get is() {
        return 'player-spells';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.subscribe('show-spellbook', () => {
            if (this._open()) {
                this._hide();
            } else {
                this._show();
            }
        });
    }

    _open() {
        this.render();
        input.block();
        return this.container.style.display === 'block';
    }

    _show() {
        input.block();
        this.container.style.display = 'block';
        this.render();
    }

    _hide() {
        input.unblock();
        this.container.style.display = 'none';
        this.render();
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    bind() {
        this.container = this.query('#container');
    }

    get template() {
        return html`
            <style>
                :host {
                }

                #dialog {
                    width: 324px;
                }

                ${BunnyStyles.dialogs}
                ${BunnyStyles.scrollbars}
                ${BunnyStyles.icons}
                ${BunnyStyles.variables}
                ${BunnyStyles.noselect}
            </style>

            <div class="dialog-container" id="container">
                <div class="dialog-overlay"></div>

                <bunny-box class="noselect dialog-center" id="dialog">
                    <div id="dialog-content">
                        <bunny-icon icon="close" class="icon" id="dialog-close" @mousedown="${this._hide.bind(this)}"></bunny-icon>
                        <span class="dialog-entity">Spells & Abilities</span>
                        
                        <div id="skills-container">
                            Spells.
                        </div>
                    </div>
                </bunny-box>
            </div>
        `;
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(PlayerSpells.is, PlayerSpells);