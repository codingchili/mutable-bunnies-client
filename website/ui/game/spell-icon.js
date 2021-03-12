import {html, render} from '/node_modules/lit-html/lit-html.js';

import '/component/bunny-tooltip.js'

class SpellIcon extends HTMLElement {

    static get is() {
        return 'spell-icon';
    }

    constructor() {
        super();

        this._available = true;
        this._charges = 0;
        this._stats = {};
        this._spell = {id: 'missing', description: 'could not find spell.'};

        application.onRealmLoaded((realm) => {
            this.realm = realm;
        });

        application.onGameLoaded(game => {
            this.game = game;
        })
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    set spell(spell) {
        this._spell = spell;
        this.render();
    }

    set stats(stats) {
        this._stats = stats;
        this.render();
    }

    set available(available) {
        this._available = available;
        this.render();
    }

    set charges(charges) {
        this._charges = charges;
        this.render();
    }

    get template() {
        let spell = this._spell;
        let description = this._description(spell);
        let charges = this._charges;
        let available = this._available;

        return html`
            <style>
                :host {
                    height: 42px;
                    display: block;
                    width: 42px;
                    padding-left: 4px;
                    padding-right: 4px;
                }

                .description {
                    margin-top: 12px;
                    display: block;
                    font-size: 14px;
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

                .physical, .poison, .raw, .heal, .magic {
                    font-weight: bold;
                }

                .physical {
                    color: #ff4a4a;
                }

                .raw {
                    color: #4eaad5;
                }

                .magic {
                    color: #ff9bfa;
                }

                .heal {
                    color: #98fc95;
                }

                .poison {
                    color: #ffcc00;
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

                .unavailable {
                    opacity: 0.5;
                }

                .spell-button {
                    position: relative;
                }

                .spell-button:hover {
                    cursor: var(--bunny-cursor-pointer, pointer);
                }

                .spell-table-headers {
                    font-size: 12px;
                }

                .spell-table-values {
                    text-align: center;
                    font-size: 14px;
                }
            </style>

            <div class="spell-button">
                <img class="spell-icon ${available ? '' : 'unavailable'}"
                     @longpress="${() => game.spells._cancel()}"
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

                ${(spell.charges > 0) ? html`
                    <span class="charges">${charges}</span>
                ` : html`
                    <slot name="cooldown"></slot>
                `}
            </div>

        `;
    }

    _description(spell) {
        let stats = this._stats;
        stats.level = stats.level || 1;
        // approximation used when health has not been calculated serverside yet.
        stats.maxhealth = stats.maxhealth || (stats.constitution * 10 + 25 * stats.level);

        let format = (value) => {
            if (typeof value === "number") {
                return Math.round(value).toLocaleString()
            } else {
                return value;
            }
        };

        let physical = (value) => html`<span class="physical">${format(value)}</span>&#x2694;`;
        let poison = (value) => html`<span class="poison">${format(value)}</span>&#x2623;`;
        let magic = (value) => html`<span class="magic">${format(value)}</span>&#x2604;`;
        let raw = (value) => html`<span class="raw">${format(value)}</span>&#x2620;`;
        let heal = (value) => html`<span class="heal">${format(value)}</span>&#x2764;`;
        let emoji = (tag) => emojify(tag);

        return eval('html`' + spell.description + '`');
    }

    render() {
        if (this.shadowRoot) {
            render(this.template, this.shadowRoot);
            this.bind();
        }
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
    }
}

customElements.define(SpellIcon.is, SpellIcon);