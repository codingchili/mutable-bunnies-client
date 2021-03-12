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

                .two-column {
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
        let settings = application.settings;
        return html`
            <div id="settings-container">
                <div class="single-column">
                    <div class="configuration-option">
                        <div>Music</div>
                        <bunny-slider current="${settings.ambient}" end="1.0"
                                      @change="${e => settings.ambient = e.detail.value}">
                        </bunny-slider>
                    </div>
                    <div class="configuration-option">
                        <div>Effects</div>
                        <bunny-slider current="${settings.effects}" end="1.0"
                                      @change="${e => settings.effects = e.detail.value}">
                        </bunny-slider>
                    </div>
                </div>
            </div>
        `;
    }

    _hotkeys() {
        return html`
            <div id="settings-container">
                <style>
                    .hotkey {
                        width: 52px;
                    }

                    bunny-input::part(input) {
                        text-align: center;
                    }

                    bunny-input[disabled]::part(input): {

                    }

                    .hotkey-column {
                        width: 100%;
                        margin-right: 32px;
                    }

                    .scrollable {
                        overflow-y: scroll;
                        max-height: 196px;
                    }
                </style>
                <div class="two-column scrollable">
                    <div class="hotkey-column">
                        <div class="configuration-option">
                            Move up
                            <bunny-input class="hotkey" disabled maxlength="1" text="w"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Move left
                            <bunny-input class="hotkey" disabled maxlength="1" text="a"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Move down
                            <bunny-input class="hotkey" disabled maxlength="1" text="s"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Move right
                            <bunny-input class="hotkey" disabled maxlength="1" text="d"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Inventory
                            <bunny-input class="hotkey" disabled maxlength="1" text="h"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Spells
                            <bunny-input class="hotkey" disabled maxlength="1" text="b"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Skills
                            <bunny-input class="hotkey" disabled maxlength="1" text="m"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Quests
                            <bunny-input class="hotkey" disabled maxlength="1" text="k"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Friends
                            <bunny-input class="hotkey" disabled maxlength="1" text="j"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Settings
                            <bunny-input class="hotkey" disabled maxlength="1" text="p"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Leave
                            <bunny-input class="hotkey" disabled maxlength="1" text="l"></bunny-input>
                        </div>
                    </div>
                    <div class="hotkey-column">
                        <div class="configuration-option">
                            Spell #1
                            <bunny-input class="hotkey" disabled maxlength="1" text="q"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Spell #2
                            <bunny-input class="hotkey" disabled maxlength="1" text="e"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Spell #3
                            <bunny-input class="hotkey" disabled maxlength="1" text="r"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Spell #4
                            <bunny-input class="hotkey" disabled maxlength="1" text="f"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Spell #5
                            <bunny-input class="hotkey" disabled maxlength="1" text="x"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Spell #6
                            <bunny-input class="hotkey" disabled maxlength="1" text="c"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Spell #7
                            <bunny-input class="hotkey" disabled maxlength="1" text="v"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Jump
                            <bunny-input class="hotkey" disabled maxlength="1" text="space"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Dance #1
                            <bunny-input class="hotkey" disabled maxlength="1" text="1"></bunny-input>
                        </div>
                        <div class="configuration-option">
                            Dance #2
                            <bunny-input class="hotkey" disabled maxlength="1" text="2"></bunny-input>
                        </div>
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
                    <div class="two-column">
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
                                <bunny-input placeholder="username" text="${dev.user}"
                                             @input="${(e) => dev.user = e.target.value}">
                                </bunny-input>
                            </div>
                            <div class="configuration-option">
                                <div>Auto pwd</div>
                                <bunny-input placeholder="password" type="password"
                                             text="${dev.pwd}"
                                             @input="${(e) => dev.pwd = e.target.value}">
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