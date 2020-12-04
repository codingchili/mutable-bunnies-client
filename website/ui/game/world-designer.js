import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '/component/styles.js';

import '/component/bunny-box.js'
import '/component/bunny-input.js'
import '/component/bunny-icon.js'
import '/component/bunny-color.js'

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
            game.designer.registry((registry) => {
                this.registry = registry;
                this._filter();
            });
        });
    }

    _filter() {
        let filter = (this.filter) ? this.filter.value : '';
        this.filtered = this.registry.filter(item => {
            return filter.length === 0
                || item.type.toLowerCase().includes(filter)
                || item.name.toLowerCase().includes(filter)
                || item.description.toLowerCase().includes(filter);
        });
        this.render();
    }

    _filterNpc() {
        this.filter.value = 'npc';
        this._filter();
    }

    _filterStructure() {
        this.filter.value = 'structure';
        this._filter();
    }

    _filterTiles() {
        this.filter.value = 'tile';
        this._filter();
    }

    _flipx() {
        game.designer.flip();
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
                    height: 600px;
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
                    margin-top: 16px;
                }

                .item-description {
                    opacity: 0.76;
                    font-size: smaller;
                    left: 82px;
                    position: absolute;
                    margin-top: 34px;
                    margin-right: 6px;
                }

                #registry-items {
                    margin-top: 16px;
                    height: 486px;
                    overflow-y: scroll;
                }

                #designer-tools {
                    display: flex;
                    justify-content: space-around;
                }

                #tools-left {
                    display: flex;
                }

                #tools-right {
                    display: flex;
                }

                ${BunnyStyles.scrollbars}
                ${BunnyStyles.noselect}
                ${BunnyStyles.icons}
                ${BunnyStyles.hr}
            </style>

            <bunny-box border class="noselect designer"
                       @mouseenter="${this._block.bind(this)}"
                       @mouseleave="${this._unblock.bind(this)}">

                <bunny-input id="filter" label="Search filter" @input="${this._filter.bind(this)}"
                             type="text" class="filter-input"></bunny-input>

                <div id="registry-items">
                    ${this.filtered.map(item => html`
                        <div class="registry-item" @click="${this._select.bind(this, item)}">
                            <div class="item-icon-container">
                                ${item.type === 'npc' ?
                                        html`<bunny-icon icon="npc" class="item-icon"></bunny-icon>` :
                                        html`<img src="${this.realm.resources}/${item.model.graphics}" class="item-icon">`
                                }
                            </div>
                            <span class="item-title">${item.name}</span>
                            <span class="item-description">${item.description}</span>
                        </div>
                    `)}
                </div>

                <hr/>

                <div id="designer-tools">
                    <div id="tools-left">
                        <bunny-icon icon="tiles" @mousedown="${this._filterTiles.bind(this)}"></bunny-icon>
                        <bunny-icon icon="structure" @mousedown="${this._filterStructure.bind(this)}"></bunny-icon>
                        <bunny-icon icon="npc" @mousedown="${this._filterNpc.bind(this)}"></bunny-icon>
                        <bunny-icon icon="flipx" @mousedown="${this._flipx.bind(this)}"></bunny-icon>
                    </div>
                    <div id="tools-right">
                        <bunny-color hex="#ffffff" @input="${this._tint.bind(this)}"></bunny-color>
                    </div>
                </div>
            </bunny-box>
        `;
    }

    _tint() {
        game.designer.tint(this.color.value);
    }

    _block() {
        input.block();
    }

    _unblock() {
        input.unblock();
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
        this.color = this.query('bunny-color');

        this.filter.addEventListener('focus', () => {
            input.block();
        });

        this.filter.addEventListener('blur', () => {
            input.unblock();
        });
    }
}

customElements.define(WorldDesigner.is, WorldDesigner);