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

        application.onCharacterLoaded(character => {
            this.character = character;
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
        this.pages = this.query('bunny-pages');
        this.pages.bind();
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
                    height: 706px;
                    margin-top: 32px;
                }

                .spell-icon {
                    width: 48px;
                    margin-top: 2px;
                    margin-bottom: -4px;
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
                ${BunnyStyles.hr}
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
                                    <bunny-tab ?active="${pc.id === game.player.classId}">
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
                                        ${this._spells(pc)}
                                    </div>
                                `)}
                            </div>
                        </bunny-pages>
                    </div>
                </bunny-box>
            </div>
        `;
    }

    _groupBy(list, get) {
        const map = {};
        list.forEach((item) => {
            const key = get(item);
            let group = map[key] || [];
            group.push(item);
            map[key] = group;
        });
        return map;
    }

    _spells(pc) {
        let items = [];
        let spells = pc.spells
            .map((spell) => this._resolve(spell))
            .map(spell => {
                spell.tier = Math.floor(Math.random() * 5);
                return spell
            })
            .sort((a, b) => a.tier - b.tier);
        let groups = this._groupBy(spells, (s) => s.tier);

        for (let tier in groups) {
            let tierName = ['I', 'II', 'III', 'IV', 'V'];
            let group = groups[tier];
            items.push(html`
                <style>
                    .tier {
                        display: flex;
                        justify-content: space-between;
                        flex-direction: row-reverse;
                    }

                    .tier-header {
                        font-family: serif;
                        margin-left: -64px;
                        margin-right: 32px;
                        height: 32px;
                        margin-top: 12px;
                        text-align: left;
                        width: 32px;
                    }
                    
                    h2 {
                        margin: 0;
                    }
                    
                    .tier-spells {
                        display: flex;
                        justify-content: center;
                        width: 100%;
                        margin-left: 48px;
                    }

                    .spell {
                        width: 96px;
                    }
                </style>
                <div class="tier">
                    <div class="tier-header">
                        <h2>${tierName[tier]}</h2>
                    </div>
                    <div class="tier-spells">
                        ${group.map(spell => html`
                            <div class="spell">
                                <img class="spell-icon"
                                     src="${this.realm.resources}gui/spell/${spell.id}.svg"
                                     class="spell-image">
                            </div>
                        `)}
                    </div>
                </div>
                <hr>
            `);
        }
        return items;
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