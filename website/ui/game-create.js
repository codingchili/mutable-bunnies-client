import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from "../component/styles.js";
import '/node_modules/ink-ripple/ink-ripple.js'
import '../component/bunny-button.js'
import '../component/bunny-input.js'
import '../component/bunny-box.js'
import '../component/bunny-tooltip.js'
import '../ui/game/stats-view.js'

class CharacterCreate extends HTMLElement {

    static get is() {
        return 'game-create';
    }

    connectedCallback() {
        this.selected = {};
        this.icon = '#';
        this.attachShadow({mode: 'open'})

        this.observer = new MutationObserver(events => {
            for (let event of events) {
                if (this.hasAttribute('hidden')) {
                    render(``, this.shadowRoot);
                } else {
                    this.showSelect();
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

    select(playerClass) {
        this.selected = playerClass;
        this.icon = `${this.realm.resources}gui/class/${this.selected.id}.svg`;
        this.showNaming(playerClass);
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

    showSelect() {
        this.selected = {};
        this.selection = true;
        this.naming = false;
        this.render();
    }

    showNaming() {
        this.selection = false;
        this.naming = true;
        this.shadowRoot.querySelector('#name').focus();
        this.render();
    }

    createCharacter(e) {
        this.characterName = this.shadowRoot.querySelector('#name').value;
        if (e.type === "click" || e.keyCode === 13) {
            if (this.characterName.length === 0)
                this.showToast('Character name must be longer than that.');
            else if (this.hasCharacter(this.characterName))
                this.showToast('You already have a character with that name');
            else {
                this.showToast('Creating character ' + this.characterName + " ..");

                this.server.create({
                    accepted: () => {
                        application.publish("character-create", {});
                        this.characterName = "";
                        this.hideToast();
                        this.showSelect();
                    },
                    error: (msg) => {
                        if (msg.status === 'CONFLICT') {
                            this.showToast('There is already a character with that name');
                        } else {
                            application.error("Failed to connect to the authentication server for character creation.");
                        }
                    }
                }, this.selected.id, this.characterName);
            }
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
                display: block;
                margin-top: -48px;
            }
            
            ${BunnyStyles.icons}
            ${BunnyStyles.ripple}
            ${BunnyStyles.noselect}
            ${BunnyStyles.headings}
            ${BunnyStyles.scrollbars}
            

            .container {    
                display: block;
                width: 582px;
                margin: auto;
                padding-bottom: 48px;
                backface-visibility: hidden;
            }
            
            .back-icon {
                position: absolute;
                right: 24px;
                top: 20px;
                padding-bottom: 9px;
                display: block;
            }

            .list {
                margin: auto;
                max-width: 625px;
            }

            .class-name {
                font-size: medium;
                display: inline;
                position: absolute;
                top: 8px;
                margin-left: 132px;
                pointer-events: none;
            }

            .realm-title {
                display: block;
                padding-top: 24px;
                margin-bottom: 24px;
                margin-left: auto;
                margin-right: auto;
                width: fit-content;
            }

            .class-description {
                font-size: 14px;
                display: inline;
                position: absolute;
                top: 46px;
                margin-left: 146px;
                margin-right: 24px;
                pointer-events: none;
            }

            .class-image {
                max-width: 128px;
                max-height: 128px;
                min-width: 128px;
                min-height: 128px;
            }

            .container {
            }

            .character-class {
                min-height: 128px;
                margin-top: 16px;
                display: block;
                position: relative;
                cursor: var(--bunny-cursor-pointer);
            }

            .spell-container {
                float: right;
                display: block;
                position: absolute;
                right: 8px;
                top: 0px;
            }

            .spell {
                width: 32px;
                height: 32px;
                float: left;
            }

            .spell-image {
                width: 32px;
                height: 32px;
            }

            .spell-name {
                font-size: medium;
                text-transform: uppercase;
            }

            .spell-description {
                margin-top: 4px;
                font-size: 14px;
            }

            .tooltip {
                width: 225px;
            }

            .tags {
                bottom: 8px;
                display: inline;
                position: absolute;
                margin-left: 145px;
                text-align: center;
                font-size: smaller;
                text-transform: uppercase;
                pointer-events: none;
            }

            .keywords {
                display: inline;
                right: 86px;
                bottom: 8px;
                position: absolute;
                float: none;
                font-size: smaller;
            }

            .create-button {
                position: absolute;
                top: 28px;
                right: 96px;
                width: 48px;
                height: 48px;
            }

            .character-name {
                position: absolute;
                top: 16px;
                left: 160px;
                width: 225px;
            }

            .class-stats {
                font-size: 14px;
                width: 176px;
            }

            .selected-class-image {
                width: 80%;
                margin-left: auto;
                margin-right: auto;
                display: block;
                opacity: 0.22;
                min-height: 465px;
            }

            .create-box {
                max-width: 625px;
                padding-bottom: 32px;
            }

            @media (max-width: 728px) {

                .create-box {
                    height: 296px;
                    margin: auto;
                }
                
                .container {
                    width: 100%;
                    margin-top: 48px;
                }

                .class-image {
                    width: 96px;
                    top: 28px;
                    left: 4px;
                    position: absolute;
                }

                .character-name {
                    position: relative;
                    width: auto;
                    left: unset;
                    top: unset;
                }

                .create-button {
                    position: absolute;
                    bottom: 0px;
                    top: 312px;
                    left: 0;
                    right: 0;
                    margin: auto;
                }

                .selected-class-image {
                    margin-left: auto;
                    margin-right: auto;
                    width: 100%;
                    display: block;
                    height: 96px;
                }

                .class-name {
                    width: 100%;
                    text-align: center;
                    margin-left: 0px;
                }

                .spell-image {
                    width: 16px;
                }

                .spell {
                    height: 16px;
                    float: none;
                }

                .class-description {
                    top: 43px;
                    left: 116px;
                    right: 34px;
                    width: 60%;
                    margin: auto;
                }

                .tags {
                    left: 0px;
                    right: 0px;
                    margin-left: 0px;
                }

                .character-class {
                    margin-top: 8px;
                    height: 158px;
                }
            }

        </style>

        <bunny-box solid class="container noselect">
            <div ?hidden="${this.naming}" style="position: relative;">
                <div class="realm-title">
                    <h4 style="display: inline-block">Select class</h4>
                    <bunny-icon class="icon back-icon" @mousedown="${this.characterlist.bind(this)}" icon="back"></bunny-icon>
                </div>

                <div class="list select">
                    <div class="wrapper">
                        ${this.playerClasses()}
                    </div>
                </div>
            </div>

            <div ?hidden="${this.selection}" style="position: relative;">
                <div class="realm-title">
                    <h4 style="display: inline-block">Name your ${this.selected.name}&nbsp;</h4>
                    <bunny-icon class="icon back-icon" @mousedown="${this.showSelect.bind(this)}" icon="back"></bunny-icon>
                </div>

                <div class="create-box">
                    <div style="position: relative">

                        <img ?hidden="${!this.selected}" src="${this.icon}"
                             class="selected-class-image">

                        <bunny-input id="name" class="character-name" value="${this.characterName}"
                                     label="Name"
                                     @keydown="${this.createCharacter.bind(this)}"></bunny-input>

                        <div class="create-button">
                            <bunny-icon @click="${this.createCharacter.bind(this)}" class="icon"
                                       icon="accept"></bunny-icon>
                       </div>

                        <stats-view .selected="${this.selected}"></stats-view>
                    </div>
                </div>
            </div>
        </bunny-box>
        
        <bunny-toast id="toaster" location="bottom"></bunny-toast>
        `;
    }

    playerClasses() {
        let classes = [];

        for (let playerClass of this.realm.classes) {
            let item = html`
                <bunny-box class="character-class" @mousedown="${this.select.bind(this, playerClass)}" ?hidden="${!this._available(playerClass)}">
                    <!-- removed as it doesn't reset properly -->
                    <!--<ink-ripple></ink-ripple>-->

                    <div class="class-image">
                        <img src="${this.realm.resources}/gui/class/${playerClass.id}.svg" id="playerclass-container">
                        <!--<bunny-tooltip location="left" for="playerclass-container">
                            <div class="class-stats">
                                Stats
                                <stats-view compact="true"
                                            selected="X{this._classInfo(playerClass.id)}">
                                </stats-view>
                            </div>
                        </bunny-tooltip>-->
                    </div>

                    <div class="class-name">${playerClass.name}</div>
                    <div class="class-description">${playerClass.description}</div>

                    <div class="spell-container">
                        ${this._spells(playerClass)}
                    </div>

                    <div class="tags">
                        ${playerClass.weapons}&nbsp;${playerClass.armors}
                    </div>

                    <div class="keywords">
                        ${playerClass.keywords}
                    </div>
                </bunny-box>
            `;

            classes.push(item);
        }

        return classes;
    }

    _isSkill(spellId) {
        return this.spells[spellId] && this.spells[spellId].skill;
    }

    _spells(playerClass) {
        let spells = [];

        for (let spell of playerClass.spells) {
            if (!this._isSkill(spell)) {
                let item = html`
                <div class="spell">
                    <img src="${this.realm.resources}/gui/spell/${spell}.svg" class="spell-image">
                </div>
                <bunny-tooltip class="tooltip">
                        <div>
                            <div class="spell-name">${this._getSpellName(spell)}</div>
                            <div class="spell-description">${this._getSpellDescription(spell, playerClass.stats)}</div>
                        </div>
                    </bunny-tooltip>
            `;

                spells.push(item);
            }
        }
        return spells;
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
        this.toaster = this.query("#toaster");
    }
}

customElements.define(CharacterCreate.is, CharacterCreate);