import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from "../../component/styles.js";

import '/node_modules/ink-ripple/ink-ripple.js';
import '/component/bunny-box.js';


class ContextMenu extends HTMLElement {

    static get is() {
        return 'context-menu';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.subscribe('context-menu', event => {
            this.target = event.target;

            /* set menu options here. */

            this.style.top = `${event.pointer.data.global.y}px`;
            this.style.left = `${event.pointer.data.global.x}px`;
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
            }
            
            ${BunnyStyles.variables}
            ${BunnyStyles.noselect}

            span {
                padding: 0.28rem;
            }

            .item {
                padding: 8px;
                cursor: pointer;
                font-size: smaller;
                position: relative;
            }

            .item:hover {
                /*background-color: #323232;*/
                color: var(--accent-color);
            }
        </style>

        <bunny-box class="noselect" border>

            <div @click="${this._party.bind(this)}" class="item" ?hidden="${!this._isPlayer(this.target)}">
                Party
                <ink-ripple></ink-ripple>
            </div>

            <div @click="${this._dialog.bind(this)}" class="item" ?hidden="${!this._hasDialog(this.target)}">
                Talk
                <ink-ripple></ink-ripple>
            </div>

            <div @click="${this._describe.bind(this)}" class="item">
                Examine
                <ink-ripple></ink-ripple>
            </div>

            <div @click="${this._trade.bind(this)}" class="item" ?hidden="${!this._isPlayer(this.target)}">
                Trade
                <ink-ripple></ink-ripple>
            </div>

            <div @click="${this._hide.bind(this)}" class="item">
                Cancel
                <ink-ripple></ink-ripple>
            </div>
        </bunny-box>
        `;
    }

    _isPlayer() {
        return this.target.account && (game.player.account !== this.target.account);
    }

    _hasDialog() {
        return this.target.interactions.includes('dialog');
    }

    _describe() {
        let description = this.target.attributes['description'] || this._read(this.target);
        //game.texts.chat(this.target, {text: description});
        application.publish('notification', description);
        this._hide();
    }

    _party() {
        social.party_invite(() => {
            application.publish('notification', 'Party invite sent.');
        }, this.target.account);
        this._hide();
    }

    _trade() {
        application.publish('notification', 'Trading with other players is not yet implemented.');
        this._hide();
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
        this._hide();
    }

    _show() {
        this.render();
        this.style.display = 'block';
        input.block();
    }

    _hide() {
        this.style.display = 'none';
        input.unblock();
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(ContextMenu.is, ContextMenu);