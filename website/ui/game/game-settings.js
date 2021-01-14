import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js';

import {BunnyStyles} from "../../component/styles.js";

import '/component/bunny-box.js'
import '/component/bunny-icon.js'
import '/component/bunny-switch.js'
import '/component/bunny-slider.js'
import '/component/bunny-pages.js'
import '/component/bunny-tab.js'
import '/component/bunny-input.js'

class GameSettings extends HTMLElement {

    static get is() {
        return 'game-settings';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.onRealmLoaded(realm => this.realm = realm);
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

        // if tabs are changed bind needs to be called.
        this.shadowRoot.querySelector('bunny-pages').bind();
    }

    get template() {
        return html`
            <style>
                :host {
                }

                #dialog {
                    width: 448px;
                    height: 324px;
                }

                #settings-container {
                    margin: 24px auto auto;
                    width: 400px;
                }

                .two-columns {
                    display: flex;
                    justify-content: space-between;
                    margin-left: 11px;
                }

                .single-column {
                    width: 296px;
                    margin: auto;
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

                bunny-input {
                    width: 93px;
                    margin: -6px 2px 0 0;
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
                                <bunny-tab>Game</bunny-tab>
                                <bunny-tab>Sound</bunny-tab>
                                <bunny-tab>Hotkeys</bunny-tab>
                                ${this.realm.isAdmin() ? html`
                                    <bunny-tab>Development</bunny-tab>` : ''}
                            </div>
                            <div slot="pages">
                                ${this._game()}
                                ${this._sound()}
                                ${this._hotkeys()}
                                ${this._admin()}
                            </div>
                        </bunny-pages>
                    </div>
                </bunny-box>
            </div>
        `;
    }

    _game() {
        let settings = application.settings;
        return html`
            <div id="settings-container">
                <div class="single-column">
                    <div class="configuration-option">
                        <div>Fullscreen</div>
                        <bunny-switch @change="${(e) => {
                            settings.fullscreen = e.detail.active;
                            if (settings.fullscreen) {
                                document.documentElement.requestFullscreen().catch((e) => {
                                    console.log(e);
                                });
                            } else {
                                document.exitFullscreen().catch((e) => {
                                    console.log(e);
                                });
                            }
                        }}" ?active="${settings.fullscreen}"></bunny-switch>
                    </div>
                </div>
            </div>
        `;
    }

    _sound() {
        return html`
            <div id="settings-container">
                <div class="single-column">
                    <div class="configuration-option">
                        <div>Music</div>
                        <bunny-slider current="80"></bunny-slider>
                    </div>
                    <div class="configuration-option">
                        <div>Effects</div>
                        <bunny-slider current="100"></bunny-slider>
                    </div>
                </div>
            </div>
        `;
    }

    _hotkeys() {
        return html`
            <div id="settings-container">
                <div class="single-column">
                    <div class="configuration-option">
                        Refresh
                        <bunny-input text="F5"></bunny-input>
                    </div>
                </div>
            </div>
        `;
    }

    _admin() {
        if (!this.realm.isAdmin()) {
            return null;
        } else {
            let dev = application.development;
            return html`
                <div id="settings-container">
                    <div class="two-columns">
                        <div class="column">
                            <div class="configuration-option">
                                <div>Hard Reset Vectors</div>
                                <bunny-switch @change="${(e) => dev.hardResetXY = e.detail.active}"
                                              ?active="${dev.hardResetXY}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Fast reconnect</div>
                                <bunny-switch @change="${(e) => dev.fastReconnect = e.detail.active}"
                                              ?active="${dev.fastReconnect}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Context menu</div>
                                <bunny-switch @change="${(e) => dev.rightClick = e.detail.active}"
                                              ?active="${dev.rightClick}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Disable cache</div>
                                <bunny-switch @change="${(e) => dev.clearCache = e.detail.active}"
                                              ?active="${dev.clearCache}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Log events</div>
                                <bunny-switch @change="${(e) => dev.logEvents = e.detail.active}"
                                              ?active="${dev.logEvents}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Metrics</div>
                                <bunny-switch
                                <bunny-switch @change="${(e) => dev.metrics = e.detail.active}"
                                              ?active="${dev.metrics}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Designer</div>
                                <bunny-switch @change="${(e) => {
                                    dev.designer = e.detail.active;
                                    application.publish(`${dev.designer ? 'show' : 'hide'}-designer`);
                                }}" ?active="${dev.designer}"></bunny-switch>
                            </div>
                        </div>
                        <div class="column">
                            <div class="configuration-option">
                                <div>Skip start</div>
                                <bunny-switch @change="${(e) => dev.skipStart = e.detail.active}"
                                              ?active="${dev.skipStart}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Auto Login</div>
                                <bunny-switch @change="${(e) => dev.autologin = e.detail.active}"
                                              ?active="${dev.autologin}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Auto Realm</div>
                                <bunny-switch @change="${(e) => dev.selectFirstRealm = e.detail.active}"
                                              ?active="${dev.selectFirstRealm}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Auto Character</div>
                                <bunny-switch
                                        @change="${(e) => dev.selectFirstCharacter = e.detail.active}"
                                        ?active="${dev.selectFirstCharacter}"></bunny-switch>
                            </div>
                            <div class="configuration-option">
                                <div>Auto user</div>
                                <bunny-input placeholder="username" text="${dev.login.user}"
                                             @input="${(e) => dev.login.user = e.target.value}">
                                </bunny-input>
                            </div>
                            <div class="configuration-option">
                                <div>Auto pwd</div>
                                <bunny-input placeholder="password" type="password"
                                             text="${dev.login.pwd}"
                                             @input="${(e) => dev.login.pwd = e.target.value}">
                                </bunny-input>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(GameSettings.is, GameSettings);