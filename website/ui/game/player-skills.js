import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js';

import {BunnyStyles} from "../../component/styles.js";

import '/component/bunny-box.js'
import '/component/bunny-tooltip.js'
import '/component/bunny-icon.js'
import '/component/bunny-progress.js'
import '/component/bunny-tab.js'
import '/component/bunny-pages.js'

class PlayerSkills extends HTMLElement {

    static get is() {
        return 'player-skills';
    }

    constructor() {
        super();
        this.skills = [];
        this.info = {};
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.onGameLoaded(game => {
            this.game = game;
        });

        application.onRealmLoaded(realm => {
            this.realm = realm;
        });

        application.subscribe('show-skills', () => {
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
        this.game.skills.state((event) => {
            this.skills = event.skills;

            if (this.skills.length > 0) {
                this._details(this.skills[0]);
            }
            this.render();
        });
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
        this.tabs = this.query('bunny-pages');
        this.tabs.bind();
    }

    get template() {
        return html`
            <style>
                :host {
                }

                #dialog {
                    width: 824px;
                    min-width: 624px;
                    height: 876px;
                }

                bunny-progress {
                    --bunny-progress-active-color: #DBC501;
                    --bunny-progress-container-color: #DBC50164;
                }

                bunny-tab {
                    --bunny-tab-background: #00000000;
                    --bunny-tab-active: #00000000;
                    --bunny-tab-background-active: var(--game-theme-opaque);
                }

                #skills-container {
                }
                
                .skill-description {
                    text-align: center;
                    width: 100%;
                    display: block;
                    margin-top: 16px;
                }
                
                .skill-icon {
                    max-width: 2.8em;
                }

                .skill-details {
                    margin: 16px;
                }

                .skill-meta {
                    display: flex;
                    flex-direction: column;
                    margin-left: 12px;
                    width: 100%;
                }

                .skill-tab {
                    display: flex;
                    width: 100%;
                }

                .skill-type {
                    text-transform: capitalize;
                }

                .skill-exp {
                    margin-top: 2px;
                    margin-right: 4px;
                }

                .skill-level {
                    opacity: 0.64;
                }

                div[slot="tabs"] {
                    display: flex;
                }

                .perks {
                    margin: 24px;
                    overflow-y: scroll;
                    overflow-x: hidden;
                    position: absolute;
                    right: 0px;
                    left: 0px;
                    bottom: 0px;
                    top: 96px;
                }

                .perk {
                    margin-top: 6px;
                    padding-bottom: 6px;
                    display: flex;
                    justify-content: space-between;
                    flex-direction: row;
                    height: 64px;
                }

                .perk-container {
                    margin: 6px;
                }

                .perk-icon {
                    width: 64px;
                }

                .perk-description {
                    opacity: 0.76;
                    margin-top: 22px;
                }

                .perk-level {
                    margin-top: 18px;
                    font-size: larger;
                    margin-right: 16px;
                }
                
                img.locked {
                    filter: grayscale(100%);
                }
                
                .locked {
                    color: #ff000088;
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
                        <span class="dialog-entity">Skills</span>

                        <bunny-pages>
                            <div slot="tabs">
                                ${this._skills()}
                            </div>
                            <div slot="pages">
                                ${this._perks()}
                            </div>
                        </bunny-pages>
                    </div>
                </bunny-box>
            </div>
        `;
    }

    _perks() {
        let items = [];
        for (let skill of this.skills) {
            if (this.info[skill.type]) {
                let info = this.info[skill.type];
                let perks = info.perks.sort((a, b) => a.level - b.level);

                items.push(html`
                    <div class="skill-details>">
                        <span class="skill-description">${info.description}</span>
                        <div class="perks">
                            ${perks.map(perk => html`
                                <bunny-box class="perk-container">
                                    <div class="perk">
                                        <img class="perk-icon ${this._locked(skill, perk)}" src="${this.realm.resources}${perk.icon}">
                                        <div class="perk-description">${perk.description}</div>
                                        <div class="perk-level ${this._locked(skill, perk)}">${perk.level}</div>
                                    </div>
                                </bunny-box>
                            `)}
                        </div>
                    </div>
                `);
            } else {
                items.push(html`
                    <div class="perk">Loading..</div>
                `);
            }
        }
        return items;
    }

    _locked(skill, perk) {
        return (perk.level > skill.level) ? 'locked' : '';
    }

    _details(skill) {
        this.game.skills.info(skill.type, info => {
            this.info[skill.type] = info.skill;
            this.render();
        });
    }

    _skills() {
        let skills = [];
        for (let skill of this.skills) {
            let percent = (skill.experience / skill.nextlevel * 100).toFixed(1);
            skills.push(html`
                <bunny-tab @mousedown="${this._details.bind(this, skill)}">
                    <div class="skill-tab">
                        <img class="skill-icon" src="${this.realm.resources}gui/skill/${skill.type}.svg">
                        <div class="skill-meta">
                            <div class="skill-type">${skill.type}</div>
                            <div class="skill-level">Lv.${skill.level}</div>
                            <div class="exp-bar">
                                <bunny-progress class="skill-exp" max="${skill.nextlevel}"
                                                value="${skill.experience}"></bunny-progress>
                            </div>
                            <bunny-tooltip>
                                <span>${skill.experience}/${skill.nextlevel} (${percent}%)</span>
                            </bunny-tooltip>
                        </div>
                    </div>
                </bunny-tab>
            `);
        }
        return skills;
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(PlayerSkills.is, PlayerSkills);