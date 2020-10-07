import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '../component/styles.js';
import '/node_modules/ink-ripple/ink-ripple.js';
import '/component/bunny-box.js';
import '/component/bunny-button.js';
import '/component/bunny-toast.js';
import '/component/bunny-tooltip.js';
import '/component/bunny-spinner.js';
import './game-create.js';

class CharacterList extends HTMLElement {

    static get is() {
        return 'game-characters';
    }

    constructor() {
        super();
        this.create = false;
        this.list = true;
        this.realm = {characters: []};

        application.onRealmSelect((realm) => {
            this.realm = realm;
            this.showLoading('Connecting..');

            Promise.all(Array.of(
                import('../script/connection.js'),
                import('../script/service/realmserver.js')))
                .then(() => {
                    this.server = new RealmServer(this.realm);

                    let creator = this.shadowRoot.querySelector('#creator');
                    creator.setServer(this.server);

                    this.showCharacters();
                    this.realmtoken();
                });
        });

        application.onLogout(() => {
            if (this.server) {
                this.server.close();
            }
        });

        application.subscribe('cancel-create', () => {
            if (this.realm.characters.length > 0) {
                this.showCharacters();
            } else {
                this.realmlist();
            }
        });

        application.subscribe('character-create', () => {
            this.showCharacters();
            this.loadCharacters();
        });
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    _level(stats) {
        if (stats.level) {
            return `Lv. ${stats.level}`;
        } else {
            return '';
        }
    }

    realmtoken() {
        this.showLoading('Authenticating..');
        new RealmRegistry().realmtoken({
            accepted: (data) => {
                this.realm.token = data.token;
                this.loadRealmInfo();
            },
            error: (err) => {
                application.error(err.message);
            }
        }, this.realm.id);
    }

    loadRealmInfo() {
        this.showLoading("Logging in..");
        this.server.connect({
            accepted: (realm) => {
                this.realm = realm;
                this.loadMetadata();
            },
            error: (err) => {
                application.error(err.message);
            }
        });
    }

    _className(classId) {
        return this.realm.classes.get(classId).name;
    }

    loadMetadata() {
        this.showLoading("Loading metadata..");
        let count = 3;
        let latch = () => {
            count--;
            if (count === 0) {
                this.loadCharacters();
                application.realmLoaded(this.realm);
            }
        };
        let metadataError = (err) => {
            application.error(err.message);
        };

        this.server.spellinfo({
            accepted: (data) => {
                this.realm.spells = data.collection;
                latch();
            },
            error: metadataError
        });
        this.server.classinfo({
            accepted: (data) => {
                this.realm.classes = data.collection;
                this.realm.classes.get = (id) => {
                    for (let playableClass of this.realm.classes) {
                        if (playableClass.id === id) {
                            return playableClass;
                        }
                    }
                    throw Error(`Class ${id} not found in realm`);
                };
                latch();
            },
            error: metadataError
        });
        this.server.afflictioninfo({
            accepted: (data) => {
                this.realm.afflictions = data.collection;
                latch();
            },
            error: metadataError
        });
    }

    loadCharacters() {
        this.realm.characters = [];
        this.showLoading('Loading characters..');
        this.server.characterlist({
            accepted: (data) => {
                Object.assign(this.realm, data.realm);

                this.hideLoading();
                this.realm.characters = data.characters;

                if (data.characters.length > 0) {
                    this.showCharacters();
                } else {
                    this.showCreate();
                }

                if (application.development.selectFirstCharacter) {
                    this.select(data.characters[0]);
                }
            },
            unauthorized: (data) => {
                application.error('The authentication server rejected the realm token when listing characters.');
            }
        });
    }

    removeCharacter(character, e) {
        e.stopPropagation();
        this.realm.characters = [];
        this.showLoading('Removing character..');

        this.server.remove({
            accepted: () => {
                this.showToast(`${character.name} is now a goner.`);
                this.loadCharacters();
            },
            error: () => {
                application.error('Failed to connect to the authentication server to delete a character.');
            }
        }, character.name);
    }

    showLoading(status) {
        this.status = status;
        this.loaded = false;
        this.render();
    }

    hideLoading() {
        this.loaded = true;
        this.render();
    }

    showCreate() {
        this.create = true;
        this.render();
    }

    showCharacters() {
        this.create = false;
        this.render();
    }

    realmlist() {
        this.server.close();
        application.showRealms();
    }

    showToast(text) {
        this.toast.open(text);
    }

    select(character) {
        if (this.realm.availableClasses.indexOf(character.classId) >= 0) {
            application.selectCharacter({
                server: this.server,
                realm: this.realm,
                character: character
            });

            for (let playerClass of this.realm.classes) {
                if (playerClass.id === character.classId) {
                    document.body.style.setProperty('--player-class-theme', playerClass.theme);
                }
            }
        } else {
            this.showToast("Sorry this class has been temporarily disabled.");
        }
    }

    get template() {
        return html`
      <style>
            :host {
                display: block;
                padding-top: 128px;
            }

            ${BunnyStyles.headings}
            ${BunnyStyles.noselect}
            ${BunnyStyles.icons}
            ${BunnyStyles.ripple}
            
            .icon {
                margin-top: -4px;
                margin-left: 8px;
            }
        
            .container {
                display: block;
                width: 582px;
                margin: auto;
                margin-bottom: 32px;
                /* super important property that fixes a 1px jump on hover. */
                backface-visibility: hidden;
            }
            
            .class-image {
                max-width: 128px;
                max-height: 128px;
                min-width: 128px;
                min-height: 128px;
            }
            
            .back-icon {
                position: absolute;
                right: 24px;
                top: 20px;
                padding-bottom: 9px;
                display: block;
            }

            .character {
                cursor: pointer;
                width: 128px;
                height: 154px;
                margin-left: 14px;
                margin-right: 14px;
                margin-bottom: 24px;
                float: left;
                padding: 2px;
            }

            .realm-title {
                display: block;
                padding-top: 24px;
                margin-bottom: 24px;
                margin-left: auto;
                margin-right: auto;
                width: fit-content;
            }

            .character-name {
                font-size: smaller;
                bottom: 4px;
                width: 100%;
                text-align: center;
            }

            .character-list-box {
                width: 480px;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                margin: auto;
                position:relative;
            }

            .character-create {
                width: 100%;
            }

            .tooltip {
                width: 148px;
                text-align: center;
                margin-top: -6px;
            }

            .tooltip-text {
                font-size: 14px;
            }

            .character-remove {
                z-index: 100;
                float: right;
                display: block;
                position: absolute;
                right: 4px;
                top: 8px;
            }

            @media (max-width: 728px) {
                :host {
                    padding-top: 36px;
                }

                .character {
                    margin-left: 12px;
                    margin-right: 12px;
                    margin-bottom: 12px;
                }

                .container {
                    width: 100%;
                    margin-bottom: 20px;
                }

                .character-list-box {
                    width: 100%;
                }
            }
            bunny-button {
                width: 100%;
                margin-top: 32px;
            }
        </style>

        <div ?hidden="${this.create}">
            <bunny-box class="container noselect" >
                <div style="position: relative;">
                    <div class="realm-title">
                        <h4 style="display: inline-block">${this.realm.name}</h4>
                    </div>
                    <bunny-icon class="icon back-icon" icon="back" @mousedown="${this.realmlist.bind(this)}"></bunny-icon>
                </div>

                <bunny-spinner text="${this.status}" ?enabled="${!this.loaded}"></bunny-spinner>

                <div class="character-list-box" ?hidden="${!this.loaded}">
                    ${this.characters()}
                    <bunny-button @click="${this.showCreate.bind(this)}">Create</bunny-button>
                </div>
            </bunny-box>
        </div>
            
            
        <game-create id="creator" ?hidden="${!this.create}" class="character-create"></game-create>
        
        <bunny-toast></bunny-toast>
        `;
    }

    characters() {
        let characters = [];

        if (this.realm.characters) {
            for (let character of this.realm.characters) {
                let item = html`
                <bunny-box style="position: relative;" class="character" @click="${this.select.bind(this, character)}" id="${character.id}">
                    <bunny-icon @click="${this.removeCharacter.bind(this, character)}" icon="close" class="character-remove"></bunny-icon>
                    <img src="${this.realm.resources}gui/class/${character.classId}.svg" class="class-image noselect">
                    <div class="character-name">${character.name}</div>
                    <ink-ripple></ink-ripple>
                </bunny-box>
                <bunny-tooltip animation-delay="0" class="tooltip" for="${character.id}">
                    <span class="tooltip-text">${this._className(character.classId)} ${this._level(character.stats)}</span>
                </bunny-tooltip>
            `;
                characters.push(item)
            }
        }
        return characters;
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
        this.toast = this.query('bunny-toast');
    }
}

customElements.define(CharacterList.is, CharacterList);