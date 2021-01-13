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

        application.onRealmLoaded(realm => {
            this.realm = realm;
        })

        application.onGameLoaded(game => {
            this.game = game;
        });

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
                    height: 876px;
                    width: 620px;
                }

                .class-image {
                    width: 86px;
                }

                #class-container {
                    display: flex;
                    margin-top: 8px;
                    padding-bottom: 8px;
                }

                .class-name {
                    text-align: center;
                    font-size: smaller;
                }
                
                .player-class {
                    margin-left: 8px;
                    margin-right: 8px;
                }

                #spell-container {
                    margin-left: 8px;
                    height: 706px;
                    overflow-y: scroll;
                    margin-top: 12px;
                }
                
                .spell-icon {
                    width: 48px;
                }

                bunny-tab {
                    --bunny-tab-background: #00000000;
                    --bunny-tab-background-active: #00000000;
                }

                .character {
                    position: relative;
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
                        <span class="dialog-entity">&nbsp;</span>

                        <bunny-pages id="class-container">
                            <div slot="tabs">
                                ${this.realm.classes.map(pc => html`
                                    <bunny-tab>
                                        <div class="player-class">

                                            <img src="${this.realm.resources}gui/class/${pc.id}.svg"
                                                 class="class-image">
                                            <div class="class-name">${pc.name}</div>
                                            <ink-ripple></ink-ripple>

                                        </div>
                                    </bunny-tab>
                                `)}
                            </div>
                            <div slot="pages">
                                ${this.realm.classes.map(pc => html`
                                    <div id="spell-container">
                                        ${pc.spells
                                                .map(spell => this._resolve(spell))
                                                .map(spell => html`
                                                    <div class="spell">
                                                        <img class="spell-icon"
                                                             src="${this.realm.resources}gui/spell/${spell.id}.svg"
                                                             class="spell-image">
                                                        <div>${spell.name}</div>
                                                        <div>${spell.description}</div>
                                                    </div>
                                                `)}
                                    </div>
                                `)}
                            </div>
                        </bunny-pages>
                    </div>
                </bunny-box>
            </div>
        `;
    }

    _resolve(id) {
        let spell = this.game.spells.getById(id);
        if (spell) {
            return spell;
        } else {
            return {
                description: "N/A",
                id: id,
                name: id
            }
        }
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(PlayerSpells.is, PlayerSpells);