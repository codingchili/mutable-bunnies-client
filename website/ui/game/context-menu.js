import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from "../../component/styles.js";

import '/node_modules/ink-ripple/ink-ripple.js';
import '/component/bunny-box.js';


class ContextMenu extends HTMLElement {

    static get is() {
        return 'context-menu';
    }

    constructor() {
        super();
        // set up default options
        this.defaultOptions = {
            block: false,
            items: [
                {
                    name: "Party",
                    filter: this._isPlayer.bind(this),
                    callback: this._party.bind(this)
                },
                {
                    name: "Talk",
                    filter: this._hasDialog.bind(this),
                    callback: this._dialog.bind(this)
                },
                {
                    name: "Inspect",
                    filter: this._hasInventory.bind(this),
                    callback: this._inspect.bind(this)
                },
                {
                    name: "Trade",
                    filter: this._isTradeable.bind(this),
                    callback: this._trade.bind(this)
                },
                {
                    name: "Examine",
                    filter: () => true,
                    callback: this._describe.bind(this)
                },]
        };
        this.options = this.defaultOptions;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.subscribe('context-menu', event => {
            this.options = event.options || this.defaultOptions;
            this.target = event.target;
            let x = input.x;
            let y = input.y;

            /* set menu options here. */
            if (event.pointer) {
                x = event.pointer.data.global.x;
                y = event.pointer.data.global.y;
            }

            this.style.top = `${y}px`;
            this.style.left = `${x}px`;
            this._show();
        });

        application.onRealmLoaded(realm => {
            this.realm = realm;
        });
    }

    get template() {
        return html`
    <style>
            :host {
                display: none;
                position: absolute;
                z-index: 1200;
            }
            
            ${BunnyStyles.variables}
            ${BunnyStyles.noselect}
            
            span {
                padding: 0.28rem;
            }

            .item {
                padding: 8px;
                cursor: var(--bunny-cursor-pointer);
                font-size: smaller;
                position: relative;
            }

            .item:hover {
                /*background-color: #323232;*/
                color: var(--accent-color);
            }
        </style>

        <bunny-box class="noselect" border>

            ${this.options.items.map(option => html`
                <div @click="${this._process.bind(this, option)}" class="item" ?hidden="${!option.filter(this.target)}">
                    ${option.name}
                    <ink-ripple></ink-ripple>
                </div>            
            `)}

            <div @click="${this._hide.bind(this)}" class="item">
                Cancel
                <ink-ripple></ink-ripple>
            </div>
        </bunny-box>
        `;
    }

    _process(option) {
        option.callback(option, this.target);
        this._hide();
    }

    _isPlayer() {
        return this.target.account && (game.player.account !== this.target.account);
    }

    _isTradeable() {
        return false; // feature switch.
    }

    _hasDialog() {
        let interactions = this.target.interactions;
        return interactions && interactions.includes('dialog');
    }

    _hasInventory() {
        return (Object.keys(this.target.inventory?.equipped ?? {}).length) > 0;
    }

    _inspect() {
        application.publish('show-inventory', {
            target: this.target,
            items: false,
            readonly: true
        });
    }

    _describe() {
        let description = this._read(this.target);
        if (this.target.attributes) {
            description = this.target.attributes['description'] || description;
        }
        //game.texts.chat(this.target, {text: description});
        application.publish('notification', description);
    }

    _party() {
        social.party_invite(() => {
            application.publish('notification', 'Party invite sent.');
        }, this.target.account);
    }

    _trade() {
        application.publish('notification', 'Trading with other players is not yet implemented.');
    }

    _read(target) {
        if (target.stats && target.stats['level']) {
            return `${target.classId ? this.realm.classes.get(target.classId).name + ' ' : ''}${target.name} lv.${target.stats['level']}`
        } else {
            return target.name;
        }
    }

    _dialog() {
        game.dialogs.start(this.target.id);
    }

    _show() {
        this.render();
        this.style.display = 'block';
        input.block();
    }

    _hide() {
        this.style.display = 'none';
        if (!this.options.block) {
            input.unblock();
        }
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(ContextMenu.is, ContextMenu);