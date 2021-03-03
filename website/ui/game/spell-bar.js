import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from '/node_modules/lit-html/directives/repeat.js';

import './spell-icon.js'

import '/component/bunny-progress.js'
import '/component/bunny-box.js'

class SpellBar extends HTMLElement {

    static get is() {
        return 'spell-bar';
    }

    constructor() {
        super();
        this.hotkeys = ['q', 'e', 'r', 'f', 'x', 'c', 'v'];
        this.spells = [];
        this.charges = {};
        this.cooldown = {};
        this.target = {};
        this.character = {
            spells: {
                learned: []
            }
        };
        this.attachShadow({mode: 'open'})
    }

    connectedCallback() {
        application.onRealmLoaded(realm => {
            this.realm = realm;
            this.spells = realm.spells;
        });

        application.onCharacterUpdate(this.render.bind(this));
        application.onCharacterLoaded(player => {
            this.character = player;
            this.render();
        });

        application.onGameLoaded((game) => {
            input.onKeysListener({
                down: (key) => {
                    let spellId = this.character.spells.learned[this.hotkeys.indexOf(key)];
                    this._cast(this._getSpellById(spellId));
                }
            }, this.hotkeys);

            game.subscribe('character-target', character => {
                this.target = character;
                this.render();
            });

            game.spells.onCharge((spellId, charges) => {
                this.charges[spellId] = charges;
                this.render();
            });

            game.spells.onCast(this._onCasted.bind(this));
            game.spells.onCooldown((spell, ms) => {
                // chargeable spells don't show any cooldown information.
                if (!this._chargeable(this._getSpellById(spell))) {
                    this.cooldown[spell] = true;
                    let bar = this.shadowRoot.querySelector(`#cd-bar-${spell}`);

                    bar.style.visibility = 'visible';
                    bar.style.setProperty('--bunny-progress-transition-duration', '0s');
                    bar.value = 0;

                    setTimeout(() => {
                        bar.style.setProperty(
                            '--bunny-progress-transition-duration',
                            (ms / 1000).toFixed(1) + 's'
                        );
                        bar.value = 100;
                    }, 32);

                    setTimeout(() => {
                        this.cooldown[spell] = false;
                        bar.style.visibility = 'hidden';
                        bar.style.setProperty('--bunny-progress-transition-duration', '0s');
                        bar.value = 0;
                        this.render();
                    }, ms);

                    this.render();
                }
            });

            game.spells.onGCD((ms) => {
                //console.log(`global gcd for ${ms}ms.`);
            });

            setTimeout(() => {
                game.spells.emit();
            }, 64);
        });
    }

    _available(spellId) {
        let spell = this._getSpellById(spellId);

        if (this._chargeable(spell)) {
            return (this.charges[spellId] > 0);
        } else {
            return (!this.cooldown[spellId]);
        }
    }

    _charges(spell) {
        return this.charges[spell.id] || 0;
    }

    _name(spellId) {
        let spell = this._getSpellById(spellId);
        if (spell) {
            return spell.name;
        } else {
            return "";
        }
    }

    _list() {
        let list = [];
        for (let spell of this.character.spells.learned) {
            if (!game.spells.getById(spell).skill) {
                list.push(this._getSpellById(spell));
            }
        }
        return list;
    }

    _chargeable(spell) {
        return spell.charges > 0;
    }

    _getSpellById(spellId) {
        return game.spells.getById(spellId);
    }

    _cast(spell) {
        if (this.casting) {
            return;
        }
        game.spells.cast(spell.id, {targetId: this.target.id});
    }

    _onCasted(casted) {
        let spell = this._getSpellById(casted.spellId);

        if (casted.result === CYCLE_CASTING) {
            this.casting = true;
            this.spellId = casted.spellId;

            let container = this.query('#casting-progress');
            let progress = this.query('#casting-progress-bar');

            container.style.visibility = 'visible';
            progress.value = 100;
            progress.style.setProperty('--bunny-progress-transition-duration', spell.casttime + 's');

            setTimeout(() => {
                this.casting = false;
                container.style.visibility = 'hidden';
                progress.style.setProperty('--bunny-progress-transition-duration', '0s');
                progress.value = 0;
                this.render();
            }, spell.casttime * 1000);

            this.render();
        } else {
            let spell = game.spells.getById(casted.spellId);

            if (casted.result === 'UNABLE') {
                application.publish('notification', `unable to cast ${spell.name}.`);
            }

            if (casted.result === 'COOLDOWN') {
                application.publish('notification', `${spell.name} is on cooldown.`);
            }

            if (casted.result === 'UNKNOWN_SPELL') {
                application.publish('notification', `has not learned ${casted.spellId}.`);
            }
        }
    }

    _learned(spell) {
        return this.character.spells.learned.indexOf(spell.id) >= 0;
    }

    get template() {
        return html`
            <style>
                :host {
                    position: absolute;
                    bottom: 16px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 326px;
                    cursor: var(--bunny-cursor, auto);
                }

                .spell-bar {
                    height: 46px;
                    display: flex;
                }

                .cooldown-bar {
                    --bunny-progress-active-color: #4db6ac;
                    --bunny-progress-container-color: #4db6ac32;
                    width: 36px;
                    margin-left: 4px;
                    margin-right: 4px;
                    position: absolute;
                    top: 40px;
                }

                @keyframes fadein {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                #casting-progress {
                    position: absolute;
                    margin-top: 4px;
                    top: -36px;
                    display: inline;
                    width: 100%;
                    animation: 0.72s fadein ease 1;
                }

                #casting-progress-bar {
                    --bunny-progress-active-color: rgba(205, 205, 205, 0.25);
                    --bunny-progress-container-color: rgba(0, 0, 0, 0.25);
                    --bunny-progress-height: 24px;
                    background-color: #000000;
                    width: 100%;
                }

                #casting-progress-title {
                    display: block;
                    width: 100%;
                    text-align: center;
                    position: absolute;
                    margin-top: -20px;
                    font-size: small;
                }

                bunny-progress {
                    --bunny-progress-transition-duration: 0.08s;
                    --bunny-progress-transition-timing-function: linear;
                }

                .title {
                    font-size: larger;
                }

                @media (max-width: 1268px) {
                    :host {
                        right: 48px;
                    }
                }

                .spell-list {
                    display: flex;
                    /* super important property that fixes a 1px jump on hover. */
                    backface-visibility: hidden;
                }

                .noselect {
                    user-select: none;
                }
            </style>

            <bunny-box class="spell-bar noselect" border>
                <div class="spell-list">
                    ${repeat(this._list(), spell => spell.id, this.spellHtml.bind(this))}
                </div>
            </bunny-box>


            <bunny-box id="casting-progress" style="visibility: hidden;">
                <bunny-progress id="casting-progress-bar" class="casting-bar transiting"></bunny-progress>
                <span id="casting-progress-title">${this._name(this.spellId)}</span>
            </bunny-box>
        `;
    }

    spellHtml(spell) {
        let available = this._available(spell.id);
        let charges = this._charges(spell);

        return html`
            <spell-icon @click="${this._cast.bind(this, spell)}"
                        .stats="${this.character.stats}"
                        .spell="${spell}"
                        .available="${available}"
                        .charges="${charges}">

                <bunny-progress slot="cooldown" id="cd-bar-${spell.id}" style="visibility: hidden;"
                                class="cooldown-bar transiting"
                                max="100"></bunny-progress>

            </spell-icon>`;
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(SpellBar.is, SpellBar);