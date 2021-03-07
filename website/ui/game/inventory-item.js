import {html, render} from '/node_modules/lit-html/lit-html.js';

import '/component/bunny-tooltip.js'
import './stats-view.js'

class InventoryItem extends HTMLElement {

    static get is() {
        return 'inventory-item';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.onRealmLoaded((realm) => {
            this.realm = realm;

            if (this._item) {
                this.render();
            }
        });
    }

    set item(value) {
        this._item = value;

        if (this.realm) {
            this.render();
        }
    }

    get item() {
        return this._item;
    }

    _rarity(level) {
        switch (level) {
            case 'common':
                return '#9f9ea4';
            case 'uncommon':
                return '#008408';
            case 'rare':
                return '#2fb2b2';
            case 'epic':
                return '#f500ff';
            case 'legendary':
                return '#b25300';
            case 'mythic':
                return '#c69113';
        }
    }

    _slot(item) {
        switch (item.slot) {
            case 'weapon':
            case 'offhand':
                return item.weaponType;
            case 'none':
                return '';
            default:
                if (item.armorType) {
                    return item.armorType;
                } else {
                    return item.slot;
                }
        }
    }

    _quantity(item) {
        return (item.quantity > 1) ? `${item.quantity}x` : '';
    }


    get template() {
        return html`
        <style>
            :host {
            }

            span {
                padding: 0.28rem;
                margin-top: 4px;
            }

            .item-stats {
                margin-top: 4px;
                font-size: small;
            }

            .item-name {
                font-size: large;
            }

            .item-description {
                margin-top: 16px;
                font-size: 14px;
            }

            .stats-header {
                display: block;
                text-transform: uppercase;
            }

            .item-slot {
                position: absolute;
                right: 16px;
                top: 28px;
                font-size: small;
            }

            .item-icon {
                cursor: var(--bunny-cursor-pointer);
                position: relative;
                width: 48px;
                height: 48px;
            }

            .item-icon > img {
                width: 48px;
                height: 48px;
            }

            .icon-quantity {
                display: block;
                position: absolute;
                right: 8px;
                top: 40px;
                font-size: small;
                text-shadow: 0 0 4px #000;
            }

            .item-info {
                min-width: 224px;
                max-width: 224px;
                /*font-family: 'Open Sans', sans-serif;*/
            }
            
            #container {
                position: relative;
            }

        </style>

        <div id="container" ?hidden="${!this.item}">
            <div class="item-icon">
                <img src="${this.realm.resources}/${this.item.icon}"/>
                <div class="icon-quantity">${this._quantity(this.item)}</div>
            </div>
            <bunny-tooltip location="top" class="stats-tooltip">
                <div class="item-info">
                    <div class="item-name">${this.item.name}</div>
                    <div class="item-slot">${this._slot(this.item)}</div>
                    <span class="stats-header"
                          style="color:${this._rarity(this.item.rarity)}">
                                        <b>${this.item.rarity}</b>
                                    </span>
                    <stats-view class="item-stats" compact="true" .selected="${this.item}"
                                style="display:block"></stats-view>
                    <div class="item-description">${this.item.description}</div>
                </div>
            </bunny-tooltip>
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
    }
}

customElements.define(InventoryItem.is, InventoryItem);