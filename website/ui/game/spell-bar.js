import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from '/node_modules/lit-html/directives/repeat.js';

import '/component/bunny-progress.js'
import '/component/bunny-tooltip.js'
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
            console.log('REALM LOADED');
            this.realm = realm;
            this.spells = realm.spells;
        });

        application.onCharacterUpdate(this.render.bind(this));
        application.onCharacterLoaded(player => {
            console.log(this.realm);
            console.log(this.spells);
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
                        setTimeout(() => {
                            bar.value = 100;
                        }, 96);
                    }, 96);

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
            return (this.charges[spellId] > 0) ? '' : 'unavailable';
        } else {
            return (!this.cooldown[spellId]) ? '' : 'unavailable';
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
            list.push(this._getSpellById(spell));
        }
        return list;
    }

    _chargeable(spell) {
        return spell.charges > 0;
    }

    _getSpellById(spellId) {
        return game.spells.getById(spellId);
    }

    _description(spell) {
        return eval('`' + spell.description + '`');
    }

    _onCast(spell) {
        this._cast(spell);
    }

    _cast(spell) {
        if (this.casting) {
            return;
        }

        game.spells.cast((casted) => {
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
                    application.publish('notification', `unknown spell ${casted.spellId}.`);
                }
            }
        }, spell.id, {targetId: this.target.id});
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
            }

            .spell-bar {
                height: 46px;
                display: flex;
            }

            .spell-icon {
                height: 42px;
                padding-left: 4px;
                padding-right: 4px;
            }

            .cooldown-bar {
                --bunny-progress-active-color: #4db6ac;
                --bunny-progress-container-color: #4db6ac32;
                width: 42px;
                margin-left: 4px;
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

            .description {
                margin-top: 12px;
                display: block;
                font-size: small;
            }

            .target {
                color: #00b0ff;
            }

            .cooldown {
                color: #00b0ff;
            }

            .casttime {
                color: #00b0ff;
            }

            .spell-info {
                width: 246px;
            }

            .info-table {
                margin-top: 12px;
                width: 100%;
            }

            .charges {
                position: absolute;
                font-size: 0.8em;
                left: 22px;
                top: 28px;
                display: block;
                text-shadow: 1px 1px #000;
                user-select: none;
            }

            @media (max-width: 1268px) {
                :host {
                    right: 48px;
                }
            }

            .unavailable {
                opacity: 0.5;
            }

            .spell-button {
                position: relative;
            }

            .spell-table-headers {
                font-size: 11px;
            }

            .spell-table-values {
                text-align: center;
                font-size: 12px;
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
        let description = this._description(spell);
        let available = this._available(spell.id);
        let charges = this._charges(spell);

        return html`
            <div @click="${this._onCast.bind(this, spell)}" class="spell-button">
                <img class="spell-icon ${available}"
                     src="${this.realm.resources}/gui/spell/${spell.id}.svg">
                <bunny-tooltip class="spell-info" location="top">
                    <span class="title">${spell.name}</span>

                    <table class="info-table">
                        <tr class="spell-table-headers">
                            <th>Cooldown</th>
                            <th>Cast</th>
                            <th>Target</th>
                        </tr>
                        <tr class="spell-table-values">
                            <td class="cooldown">${spell.cooldown}s</td>
                            <td class="casttime">${spell.casttime}s</td>
                            <td class="target">${spell.target}</td>
                        </tr>
                    </table>

                    <span class="description">${description}</span>

                </bunny-tooltip>
                
                ${this._chargeable(spell) ?
            html`
                        <span class="charges">${charges}</span>
                    ` : html`
                        <bunny-progress id="cd-bar-${spell.id}" style="visibility: hidden;" class="cooldown-bar transiting"
                                        max="100" value="0"></bunny-progress>
                    `}
            </div>`;
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(SpellBar.is, SpellBar);