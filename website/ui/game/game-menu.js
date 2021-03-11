import {html, render} from '/node_modules/lit-html/lit-html.js';

import {BunnyStyles} from "/component/styles.js";
import '/component/bunny-icon.js'
import '/component/bunny-box.js'
import '/component/bunny-tooltip.js'


class GameMenu extends HTMLElement {

    static get is() {
        return 'game-menu';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
        application.onRealmLoaded(realm => {
            this.realm = realm;
            this.render();
        });
        application.onGameLoaded(() => this._hotkeys());
    }

    _hotkeys() {
        let bind = (handler, key) => input.onKeyDown(handler.bind(this), key);
        bind(this._inventory, 'h');
        bind(this._spellbook, 'b');
        bind(this._skills, 'm');
        bind(this._quests, 'k');
        bind(this._friends, 'j');
        bind(this._settings, 'p');
        bind(this._characters, 'l');
    }

    get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                ${BunnyStyles.variables}
                ${BunnyStyles.icons}
                
                .interface-box {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    right: 16px;
                    display: block;
                    padding-left: 8px;
                    padding-right: 8px;
                    z-index: 400;
                }

                @media (max-width: 868px) {
                    .interface-box {
                        right: 0;
                        padding-right: 0;
                    }
                }
                
                @media (max-height: 280px) {
                    .interface-box {
                        right: 0;
                        padding-right: 0;
                        top: 0;
                        bottom: 0;
                        overflow-y: scroll;
                        transform: unset;
                    }

                    .item-list {
                        overflow-y: scroll;
                    }
                }

                .menu-icon {
                    display: block;
                    max-height: 32px;
                    max-width: 32px;
                    margin-top: 6px;
                    margin-bottom: 6px;
                    fill: #fff;
                    height: 32px;
                    width: 32px;
                }

                .icon {
                    width: 32px;
                    height: 32px;
                }

                .menu-icon-disabled {
                    fill: #646464;
                }

                .menu-icon:hover {
                    fill: var(--accent-color);
                    cursor: var(--bunny-cursor-pointer);
                }

                .menu-icon-disabled:hover {
                    fill: #646464;
                }

                .item-container {
                    position: relative;
                    padding-left: 4px;
                    padding-right: 4px;
                }

                bunny-icon {
                    height: 32px;
                    width: 32px;
                    display: block;
                }

                bunny-icon:hover {
                    cursor: var(--bunny-cursor-pointer);
                }

            </style>

            <div @touchstart="${e => e.stopPropagation()}" class="interface-box">

                <bunny-box class="item-list">
                    <div class="item-container">
                        <bunny-icon @mousedown="${this._inventory.bind(this)}" icon="inventory"
                                    class="icon menu-icon"></bunny-icon>
                        <bunny-tooltip class="tooltip" location="left">
                            <span class="description">Inventory [H]</span>
                        </bunny-tooltip>
                    </div>

                    <div class="item-container">
                        <bunny-icon @mousedown="${this._spellbook.bind(this)}" icon="spellbook"
                                    class="icon menu-icon"></bunny-icon>
                        <bunny-tooltip class="tooltip" location="left">
                            <span class="description">Spells & Abilities [B]</span>
                        </bunny-tooltip>
                    </div>

                    <div class="item-container">
                        <bunny-icon @mousedown="${this._skills.bind(this)}" icon="skills"
                                    class="icon menu-icon"></bunny-icon>
                        <bunny-tooltip class="tooltip" location="left">
                            <span class="description">Skills [M]</span>
                        </bunny-tooltip>
                    </div>

                    <div class="item-container">
                        <bunny-icon @mousedown="${this._quests.bind(this)}" icon="quests"
                                    class="icon menu-icon"></bunny-icon>
                        <bunny-tooltip class="tooltip" location="left">
                            <span class="description">Quests [K]</span>
                        </bunny-tooltip>
                    </div>

                    <div class="item-container">
                        <bunny-icon @mousedown="${this._friends.bind(this)}" icon="friends"
                                    class="icon menu-icon"></bunny-icon>
                        <bunny-tooltip class="tooltip" location="left">
                            <span class="description">Friends [J]</span>
                        </bunny-tooltip>
                    </div>

                    <div class="item-container">
                        <bunny-icon @mousedown="${this._settings.bind(this)}" icon="settings"
                                    class="icon menu-icon"></bunny-icon>
                        <bunny-tooltip class="tooltip" location="left">
                            <span class="description">Settings [P]</span>
                        </bunny-tooltip>
                    </div>

                    <div class="item-container">
                        <bunny-icon @mousedown="${this._characters.bind(this)}" icon="leave"
                                    class="icon menu-icon"></bunny-icon>
                        <bunny-tooltip class="tooltip" location="left">
                            <span class="description">Leave [L]</span>
                        </bunny-tooltip>
                    </div>
                </bunny-box>
            </div>

        `;
    }

    _inventory() {
        application.publish('show-inventory');
    }

    _quests() {
        application.publish('show-quests');
    }

    _friends() {
        application.publish('show-friends');
    }

    _settings() {
        application.publish('show-settings');
    }

    _spellbook() {
        application.publish('show-spellbook');
    }

    _skills() {
        application.publish('show-skills');
    }

    _characters(e) {
        game.shutdown();
        application.scriptShutdown();
        application.showCharacters();
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(GameMenu.is, GameMenu);