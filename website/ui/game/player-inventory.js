import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from '/node_modules/lit-html/directives/repeat.js';
import {BunnyStyles} from "../../component/styles.js";

import '/component/bunny-box.js'
import '/component/bunny-icon.js'
import './inventory-item.js'

class PlayerInventory extends HTMLElement {

    static get is() {
        return 'player-inventory';
    }

    constructor() {
        super();
        this._clear();
    }

    _clear() {
        this.inventory = {
            equipped: {},
            currency: 0
        };
        this.slots = ['head', 'chest', 'legs', 'weapon', 'offhand', 'ring', 'neck', 'cloak', 'foot'];
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
        this.realm = {};

        application.onGameLoaded((game) => {
            this._clear();

            game.inventory.onInventoryUpdated(inventory => {
                this.inventory = inventory;
                this.render();
            });

            input.onKeysListener({
                down: () => {
                    application.publish('show-inventory');
                }
            }, 'h');
        });

        application.subscribe('show-inventory', () => {
            if (this._open()) {
                this._hide();
            } else {
                this._show();
            }
        });

        application.onRealmLoaded(realm => {
            this.realm = realm;
        });

        application.onCharacterLoaded(character => {
            this.classId = character.classId;
            this.name = character.name;
            this.inventory = character.inventory;
        });
    }

    _currency() {
        return this.inventory.currency.toLocaleString();
    }

    _unequip(item) {
        game.inventory.unequipItem(this._slot(item));
    }

    _equip(item) {
        input.ifLeftMouse(() => {
            application.publish('context-menu', {
                target: item,
                options: {
                    block: true,
                    items: [{
                        name: "Use",
                        filter: () => item.consumable,
                        callback: () => {
                            game.inventory.useItem(item)
                        }
                    }, {
                        name: "Equip",
                        filter: () => item.slot !== 'none',
                        callback: () => {
                            game.inventory.equipItem(item)
                        }
                    }, {
                        name: "Drop",
                        filter: () => true,
                        callback: () => {
                            game.inventory.dropItem(item)
                        }
                    }
                    ]
                }
            });
        });
        input.ifRightMouse(() => {
            if (item.slot !== 'none') {
                game.inventory.equipItem(item);
            } else {
                game.inventory.useItem(item);
            }
        });
    }

    _drop() {
        //
    }

    _slot(slot) {
        let equipped = this.inventory.equipped[slot];
        if (equipped) {
            return equipped;
        } else {
            // return placeholder icon.
            return {
                name: slot,
                description: `Items with slot '${slot}' can be equipped here.`,
                icon: this._getIcon(slot)
            };
        }
    }

    _getIcon(slot) {
        let armors = ['head', 'chest', 'legs'];
        let template = application.realm.classes.get(this.classId);

        // custom class specific slot icons.
        if (armors.includes(slot)) {
            return `gui/item/icon/slots/${slot}_${template.armors[0]}.svg`;
        } else if (slot === 'weapon') {
            return `gui/item/icon/slots/${slot}_${template.weapons[0]}.svg`;
        } else {
            return `gui/item/icon/slots/${slot}.svg`;
        }
    }

    _open() {
        return this.container && this.container.style.display === 'block';
    }

    _show() {
        this.render();
        input.block();
        this.container.style.display = 'block';
    }

    _hide() {
        input.unblock();
        this.container.style.display = 'none';
    }

    get template() {
        return html`
        <style>
            :host {
            }
            
            #container {
                display: none;
            }

            #dialog {
                min-width: 428px;
                max-width: 428px;
                min-height: 112px;
            }
            
            ${BunnyStyles.dialogs}
            ${BunnyStyles.noselect}
            ${BunnyStyles.icons}

            span {
                padding: 0.28rem;
            }

            #loot-items {
                display: flex;
                flex-wrap: wrap;
                justify-content: left;
                min-height: 48px;
                padding-bottom: 16px;
                padding-left: 8px;
                padding-right: 8px;
                user-select: none;
            }

            .slot_row {
                display: flex;
                justify-content: center;
            }

            .spacer {
                width: 48px;
            }

            .currency-box {
                width: 86px;
                height: 16px;
                position: absolute;
                right: 8px;
                display: flex;
                justify-content: flex-end;
                top: 216px;
            }

            .currency-text {
                display: block;
                padding: 0;
                padding-right: 2px;
                margin-top: -4px;
            }

            .currency-icon {
                width: 16px;
                margin-top: -6px;
            }

        </style>

        <div class="dialog-container" id="container">
            <div class="dialog-overlay"></div>

            <bunny-box class="noselect dialog-center" id="dialog">
                <bunny-icon icon="close" class="icon" id="dialog-close" @mousedown="${this._hide.bind(this)}"></bunny-icon>

                <span class="dialog-entity">${this.name}'s inventory</span>


                <div class="slots" ?hidden="${!this.name}">
                    <div class="slot_row">
                        <div class="spacer"></div>
                        
                        ${['head', 'cloak'].map(slot => html`
                            <inventory-item @mousedown="${this._unequip.bind(this, slot)}" .item="${this._slot(slot)}"></inventory-item>
                        `)}
                    </div>


                    <div class="slot_row">
                        ${['offhand', 'chest', 'weapon'].map(slot => html`
                            <inventory-item @mousedown="${this._unequip.bind(this, slot)}" .item="${this._slot(slot)}"></inventory-item>
                        `)}
                    </div>

                    <div class="slot_row">
                        <div class="spacer"></div>
                        <inventory-item @mousedown="${this._unequip.bind(this, 'legs')}" .item="${this._slot('legs')}"></inventory-item>
                        <div class="spacer"></div>
                    </div>

                    <div class="slot_row">
                        ${['neck', 'foot', 'ring'].map(slot => html`
                            <inventory-item @mousedown="${this._unequip.bind(this, slot)}" .item="${this._slot(slot)}"></inventory-item>
                        `)}
                    </div>
                </div>

                <div class="currency-box">
                    <span class="currency-text">${this._currency(this.inventory)}</span>
                    <img class="currency-icon" src="${this.realm.resources}/gui/item/icon/slots/currency_coin.svg">
                </div>

                <hr>

                <div id="loot-items">
                    ${repeat(this.inventory.items, item => item.id, (item) => html`
                        <div @mousedown="${this._equip.bind(this, item)}">
                            <inventory-item .item="${item}"></inventory-item>
                        </div>
                    `)}
                </div>
            </bunny-box>
        </div>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
        this.container = this.query('#container');
    }
}

customElements.define(PlayerInventory.is, PlayerInventory);