import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js';

import {BunnyStyles} from "../../component/styles.js";

import '/component/bunny-box.js'
import '/component/bunny-icon.js'
import '/component/bunny-switch.js'
import '/component/bunny-slider.js'
import '/component/bunny-pages.js'
import '/component/bunny-tab.js'

class GameSettings extends HTMLElement {

    static get is() {
        return 'game-settings';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.subscribe('show-settings', () => {
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
                    width: 376px;
                    height: 292px;
                }

                #settings-container {
                    width: 296px;
                    margin: 24px auto auto;
                }
                
                bunny-pages {
                    margin-top: 24px;
                }

                bunny-tab {
                    --bunny-tab-background: #00000000;
                    --bunny-tab-background-active: #00000000;
                }

                .configuration-option {
                    margin: auto;
                    display: flex;
                    justify-content: space-between;
                    margin-top: 4px;
                }

                bunny-switch {
                    --bunny-switch-on: #00b0ff;
                }

                bunny-slider {
                    width: 142px;
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
                        <bunny-icon icon="close" class="icon" id="dialog-close"
                                    @mousedown="${this._hide.bind(this)}"></bunny-icon>
                        <span class="dialog-entity"></span>

                        <bunny-pages>
                            <div slot="tabs">
                                <bunny-tab>System</bunny-tab>
                                <bunny-tab>Music</bunny-tab>
                                <bunny-tab>Advanced</bunny-tab>
                            </div>
                            <div slot="pages">
                                <div id="settings-container">
                                    <div class="configuration-option">
                                        <div>Awesome</div>
                                        <bunny-switch></bunny-switch>
                                    </div>
                                    <div class="configuration-option">
                                        <div>Awesome</div>
                                        <bunny-switch active></bunny-switch>
                                    </div>

                                    <div class="configuration-option">
                                        <div>Awesome</div>
                                        <bunny-slider current="40"></bunny-slider>
                                    </div>

                                    <div class="configuration-option">
                                        <div>Awesome</div>
                                        <bunny-slider current="40"></bunny-slider>
                                    </div>

                                    <div class="configuration-option">
                                        <div>Awesome</div>
                                        <bunny-slider current="40"></bunny-slider>
                                    </div>
                                </div>


                                <div id="settings-container">
                                    <div class="configuration-option">
                                        <div>PWN Level</div>
                                        <bunny-slider current="40"></bunny-slider>
                                    </div>
                                </div>

                                <div id="settings-container">
                                    <div class="configuration-option">
                                        <div>Hackertag</div>
                                        <bunny-slider current="40"></bunny-slider>
                                    </div>
                                </div>

                            </div>
                        </bunny-pages>
                    </div>
                </bunny-box>
            </div>
        `;
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(GameSettings.is, GameSettings);