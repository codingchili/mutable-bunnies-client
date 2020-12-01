import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '/component/styles.js';

import '/component/bunny-box.js'
import '/component/bunny-input.js'

class WorldDesigner extends HTMLElement {

    static get is() {
        return 'world-designer';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
        this.registry = [];

        application.onRealmLoaded((realm) => {
            this.realm = realm;
        });

        application.onGameLoaded((game) => {
            input.onKeysListener({
                down: (key) => {
                    if (key === input.LMB) {
                        game.designer.commit();
                    }
                    if (key === input.ESCAPE) {
                        game.designer.unload();
                    }
                }
            }, [input.LMB, input.ESCAPE]);

            game.designer.registry((registry) => {
                this.registry = registry.collection;
                this._filter();
            });
        });
    }

    _filter() {
        let filter = (this.filter) ? this.filter.value : '';
        this.filtered = this.registry.filter(item => {
            return filter.length === 0
                || item.name.toLowerCase().includes(filter)
                || item.description.toLowerCase().includes(filter);
        });
        this.render();
    }

    _select(item) {
        game.designer.load(item.id);
    }

    get template() {
        return html`
        <style>
            .designer {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                left: 16px;
                display: block;
                padding-left: 8px;
                padding-right: 8px;
                height: 60%;
                width: 276px;
                z-index: 400;
            }

            .registry-item {
                width: 100%;
                position: relative;
            }

            .registry-item:hover {
                background-color: #323232;
                cursor: var(--bunny-cursor-pointer, pointer);
            }

            .item-icon-container {
                width: 64px;
                height: 64px;
                display: inline-flex;
                flex-direction: column;
            }

            .item-icon {
                max-width: 64px;
                max-height: 64px;
                margin: auto;
                text-align: center;
            }

            .item-title {
                position: absolute;
                left: 82px;
                margin-top: 8px;
            }

            .item-description {
                opacity: 0.76;
                font-size: smaller;
                left: 82px;
                position: absolute;
                margin-top: 26px;
                margin-right: 6px;
            }

            #registry-items {
                margin-top: 16px;
                max-height: 85%;
                overflow-y: scroll;
            }
            
            ${BunnyStyles.scrollbars}
            ${BunnyStyles.noselect}
        </style>

        <bunny-box border class="noselect designer">
            <bunny-input id="filter" label="Search filter" @input="${this._filter.bind(this)}"
                         type="text" class="filter-input"></bunny-input>

            <div id="registry-items">                
                ${this.filtered.map(item => html`
                    <div class="registry-item" @click="${this._select.bind(this, item)}">
                        <div class="item-icon-container">
                            <img src="${this.realm.resources}/${item.model.graphics}" class="item-icon">
                        </div>
                        <span class="item-title">${item.name}</span>
                        <span class="item-description">${item.description}</span>
                    </div>                        
                `)}
            </div>

            <div id="designer-tools">
                <div>
                    <!--<svg on-down="_characters" class="menu-icon">
                        <use href$="[[realm.resources]]gui/menu/leave.svg#root"></use>
                    </svg>
                    <paper-tooltip animation-delay="0" class="tooltip" position="left">
                        <span class="description">Leave [L]</span>
                    </paper-tooltip>-->
                </div>
            </div>
        </bunny-box>
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
        this.filter = this.query('#filter');

        this.filter.addEventListener('focus', () => {
            input.block();
        });

        this.filter.addEventListener('blur', () => {
            input.unblock();
        });
    }
}

customElements.define(WorldDesigner.is, WorldDesigner);