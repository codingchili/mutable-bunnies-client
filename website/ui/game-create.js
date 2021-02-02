import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js';

import {BunnyStyles} from "../component/styles.js";

import './game/stats-view.js'
import '/component/bunny-box.js'
import '/component/bunny-icon.js'
import '/component/bunny-pages.js'
import '/component/bunny-tab.js'
import '/component/bunny-button.js'
import '/component/bunny-input.js'
import '/component/bunny-toast.js'
import '/component/bunny-progress.js'

class CharacterCreate extends HTMLElement {

    static get is() {
        return 'game-create';
    }

    connectedCallback() {
        this.selected = {};
        this.icon = '#';
        this.characterName = '';
        this.attachShadow({mode: 'open'})

        this.observer = new MutationObserver(events => {
            for (let event of events) {
                if (this.hasAttribute('hidden')) {
                    render(``, this.shadowRoot);
                } else {
                    this.render();
                }
            }
        });
        this.observer.observe(this, {attributes: true})

        application.onRealmLoaded((realm) => {
            this.realm = realm;
            this.spells = {};
            realm.spells.forEach(spell => {
                this.spells[spell.id] = spell;
            })
        });
    }

    _available(playerclass) {
        for (let aClass of this.realm.availableClasses) {
            if (aClass === playerclass.id) {
                return true;
            }
        }
        return false;
    }

    _getSpellDescription(spellId, stats) {
        let spell = this.spells[spellId];
        if (spell) {
            this.character = {stats: stats};
            return eval('`' + this.spells[spellId].description + '`');
        } else {
            return "No description, possibly OP.";
        }
    }

    _getSpellName(spellId) {
        let spell = this.spells[spellId];

        if (spell) {
            return spell.name;
        } else {
            return spellId;
        }
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    bind() {
        this.container = this.query('#container');
        this.toaster = this.query("#toaster");
        this.pages = this.query('bunny-pages');
        this.pages.bind();
    }

    _submit(pc, e) {
        if (e.keyCode === 13) {
            this.createCharacter(pc, e);
        }
    }

    _input(e) {
        this.characterName = e?.target?.value ?? this.characterName;
    }

    createCharacter(pc) {
        if (this.characterName.length === 0)
            this.showToast('Character name must be longer than that.');
        else if (this.hasCharacter(this.characterName))
            this.showToast('You already have a character with that name');
        else {
            this.showToast('Creating character ' + this.characterName + " ..");

            this.server.create({
                accepted: () => {
                    application.publish("character-create", {});
                    this.selected = {};
                    this.characterName = "";
                    this.showToast(`created character ${this.characterName}`);
                },
                error: (msg) => {
                    if (msg.status === 'CONFLICT') {
                        this.showToast('There is already a character with that name');
                    } else {
                        application.error("Failed to connect to the authentication server for character creation.");
                    }
                }
            }, pc.id, this.characterName);
        }
    }

    showToast(text) {
        this.toaster.open(text);
    }

    hideToast() {
        this.toaster.close();
    }

    setServer(server) {
        this.server = server;
    }

    hasCharacter(name) {
        for (let i = 0; i < this.realm.characters.length; i++)
            if (this.realm.characters[i].name === name)
                return true;

        return false;
    }

    characterlist() {
        this.selected = {};
        this.characterName = "";
        application.publish("cancel-create", {});
    }

    get template() {
        return html`
            <style>
                :host {
                }

                #dialog {
                    width: 620px;
                    height: 718px;
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
                    display: flex;
                    justify-content: center;
                    margin-top: 30px;
                    margin-bottom: 10px;
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

                .keywords {
                    display: inline;
                    right: 86px;
                    bottom: 8px;
                    position: absolute;
                    float: none;
                    font-size: smaller;
                }

                .tags {
                    bottom: 8px;
                    */ display: block;
                    text-align: center;
                    font-size: smaller;
                    text-transform: uppercase;
                    pointer-events: none;
                    margin-top: 8px;
                }

                .description {
                    margin: 32px;
                    opacity: 0.86;
                }

                bunny-input {
                    width: 224px;
                    margin: auto;
                }

                .gif {
                    position: absolute;
                    top: 282px;
                    height: 324px;
                    left: 50%;
                    transform: translateX(-50%);
                }

                stats-view {
                    /*width: 92%;*/
                    margin: auto;
                }

                bunny-button {
                    margin-top: 19px;
                    display: block;
                }

                ${BunnyStyles.dialogs}
                ${BunnyStyles.scrollbars}
                ${BunnyStyles.icons}
                ${BunnyStyles.variables}
                ${BunnyStyles.noselect}
                ${BunnyStyles.hr}
            </style>


            <bunny-box class="noselect dialog-center" id="dialog">
                <div id="dialog-content">
                    <bunny-icon icon="back" class="icon" id="dialog-close"
                                @mousedown="${this.characterlist.bind(this)}"></bunny-icon>
                    <span class="dialog-entity">&nbsp;</span>

                    <bunny-pages id="class-container" unselected>
                        <div slot="tabs">
                            ${this.realm.classes
                                    .filter(this._available.bind(this))
                                    .map(pc => html`
                                        <bunny-tab @mousedown="${this._details.bind(this, pc)}">
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
                            ${this.realm.classes
                                    .filter(this._available.bind(this))
                                    .map(pc => (pc !== this.selected) ? html`
                                        <div></div>` : html`
                                        <div>
                                            <div class="description">${pc.description}</div>
                                            <bunny-input autofocus
                                                         @keydown="${this._submit.bind(this, pc)}"
                                                         @input="${this._input.bind(this)}"
                                                         label="Name" id="${pc.id}"></bunny-input>
                                            <stats-view compact .selected="${pc}"></stats-view>
                                            <video muted loop autoplay
                                                   src="${this.realm.resources}gui/preview/${pc.id}-idle.webm"
                                                   class="gif"></video>
                                            <!--<div class="tags">
                                                X{pc.weapons.join(' ')}&nbsp;X{pc.armors.join(' ')}
                                            </div>-->
                                            <div id="spell-container">
                                                ${this._spells(pc)}
                                            </div>
                                            <bunny-button @click="${this.createCharacter.bind(this, pc)}">create
                                            </bunny-button>
                                        </div>
                                    `)
                            }
                        </div>
                    </bunny-pages>
                </div>
                ${this.selected.id ? `` : html`
                    <style>
                        .stats-container {
                            width: 80%;
                            margin: auto;
                        }

                        .class-stats {
                            display: flex;
                            flex-direction: row;
                            position: relative;
                        }

                        .class-stats-img {
                            height: 42px;
                        }

                        bunny-progress {
                            width: 100%;
                            margin-left: 22px;
                            margin-top: 20px;
                        }

                        .highlight {
                            font-weight: bold;
                            color: var(--accent-color);
                        }

                        .class-help {
                            text-align: center;
                            display: block;
                            margin: 24px;
                            opacity: 0.86;
                        }

                        .help-top {
                            margin-top: 48px;
                        }
                    </style>

                    <div class="stats-container">
                        <span class="class-help help-top">To make choosing a player class easier, here are some statistics to help. Hover
                        on the bars for more information.</span>
                        ${this.realm.classes
                                .filter(this._available.bind(this))
                                .map(pc => html`
                                    <style>
                                        .progress-${pc.id} {
                                            --bunny-progress-active-color: ${pc.theme};
                                            --bunny-progress-height: 12px;
                                            --bunny-progress-container-color: #323232;
                                        }
                                    </style>
                                    <div class="class-stats">
                                        <img src="${this.realm.resources}gui/class/${pc.id}.svg"
                                             class="class-stats-img">
                                        <bunny-progress
                                                value="${Math.random() * 100}"
                                                max="100"
                                                class="progress-${pc.id}">
                                        </bunny-progress>
                                        <bunny-tooltip location="top">
                                            <span class="highlight">${Math.trunc(Math.random() * 100)}%</span> of
                                            players chose the ${pc.name} class,<br>
                                            There is a total of <span
                                                class="highlight">${Math.trunc(Math.random() * 10000)}</span>
                                            ${pc.name}'s in this realm..
                                        </bunny-tooltip>
                                    </div>
                                `)
                        }
                        <span class="class-help">The Necromancer and Slayer classes are not recommended for beginners.</span>
                    </div>
                `}
            </bunny-box>
            <bunny-toast id="toaster" location="bottom"></bunny-toast>
        `;
    }

    _details(pc) {
        this.selected = pc;
        this.render();
        let input = this.shadowRoot.querySelector(`bunny-input#${pc.id}`);
        input.value = this.characterName;
        input.focus();
    }

    _spells(pc) {
        return pc.spells
            .map((spell) => this._resolve(spell))
            .map(spell => {
                spell.tier = Math.floor(Math.random() * 5);
                return spell
            })
            .sort((a, b) => a.tier - b.tier)
            .map(spell => html`
                <img class="spell-icon" src="${this.realm.resources}gui/spell/${spell.id}.svg" class="spell-image">
            `);
    }

    _resolve(id) {
        let spell = {
            description: "N/A",
            id: id,
            name: id
        };

        this.realm.spells.filter(spell => spell.id === id)
            .map(found => spell = found);

        return spell;
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(CharacterCreate.is, CharacterCreate);