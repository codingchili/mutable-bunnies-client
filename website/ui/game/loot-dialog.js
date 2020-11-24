import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from '/node_modules/lit-html/directives/repeat.js';
import {BunnyStyles} from '../../component/styles.js'

import '/component/bunny-box.js';
import '/component/bunny-icon.js';
import './inventory-item.js';

class LootDialog extends HTMLElement {

    static get is() {
        return 'loot-dialog';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});

        application.onGameLoaded(() => {
            server.connection.setHandler('loot_list', {
                accepted: (e) => {
                    this.target = game.entities[e.targetId];
                    this.loot = e.lootList;

                    if (e.lootList.length > 0) {
                        this._start();
                    } else {
                        this.target.interactive = false;
                        this._stop();
                    }
                },
                error: (event) => {
                    application.publish('notification', event.message);
                }
            });
        });

        application.onRealmLoaded((realm) => {
            this.realm = realm;
        })
    }

    _loot(item) {
        game.inventory.takeLoot(this.target, item);
    }

    _start() {
        this.render();
        this.container.style.display = 'block';
        input.block();
    }

    _stop() {
        this.container.style.display = 'none';
        game.inventory.unsubscribeLootList(this.target);
        input.unblock();
    }

    get template() {
        return html`
        <style>
            :host {
            }

            #dialog {
                max-width: 428px;
                min-height: 112px;
                min-width: 428px;
            }
            
            #container {
                display: none;
            }

            span {
                padding: 0.28rem;
            }

            #loot-items {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                padding-bottom: 24px;
            }
            
            ${BunnyStyles.icons}
            ${BunnyStyles.dialogs}
        </style>

        <div class="dialog-container" id="container">
            <div class="dialog-overlay"></div>

            <bunny-box class="noselect dialog-center" id="dialog" border>
                <bunny-icon icon="close" class="icon" id="dialog-close" @mousedown="${this._stop.bind(this)}"></bunny-icon>

                <span class="dialog-entity">${this.target.name}</span>

                <div id="loot-items">
                    ${repeat(this.loot, item => item.id, item => html`
                        <div @click="${this._loot.bind(this, item)}">
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

customElements.define(LootDialog.is, LootDialog);