import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from '/node_modules/lit-html/directives/repeat.js';

import {BunnyStyles} from '../../component/styles.js';

import '/component/bunny-box.js'
import '/component/bunny-icon.js'
import '/component/bunny-button.js'


class PartyView extends HTMLElement {

    static get is() {
        return 'party-view';
    }

    constructor() {
        super();
        this.invite = [];
        this.members = [];
        this.target = false;
        this.remaining = 0;
        this.INVITE_TIMEOUT = 29000; // ~30s.


        application.onRealmLoaded(realm => {
            this.members = [];
            this.realm = realm;
        });

        application.onGameLoaded((game) => {
            this.account = application.token.domain;
            this.game = game;

            import('../../script/service/social.js');

            this._listen();
        });
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
    }

    _leave() {
        social.party_leave(() => {
            this.members = [];
            this.render();
        });
    }

    _inParty() {
        return this.members.length > 0;
    }

    _listen() {
        setInterval(() => {
            if (this.remaining > 0) {
                this.remaining -= 1;
                this.render();
            }
        }, 1000);

        this.game.subscribe('player-spawn', event => {
            // update members when a player changes character.
            if (this.members.includes(event.account) || event.account === this.account) {
                this.render();
            }
        });

        this.game.subscribe('player-leave', event => {
            // set a placeholder when a player is connected but not in the game.
            if (this.members.includes(event.account)) {
                this.render();
            }
        });

        server.connection.setHandler('party_invite', event => {
            this.remaining = 30;
            this.invite = event;
            this._show();
        });

        server.connection.setHandler('party_leave', event => {
            this.members = this.members.filter(member => {
                return member !== event.member;
            });
            game.chat.add({text: `${event.member} has left the party.`, party: true});
            this.render();
        });

        server.connection.setHandler('party_invite_response', event => {
            if (event.accepted) {
                this.members.push(event.from);
                this.render();
            } else {
                game.chat.add({text: `${event.from} has declined the invite.`, party: true});
            }
        });
    }

    _member(account) {
        let entity = this.game.getByAccount(account);
        if (!entity) {
            return {
                name: account,
                classId: 'placeholder',
                stats: {
                    energy: 0,
                    maxenergy: 1,
                    health: 0,
                    maxhealth: 1,
                    nextlevel: 1,
                    experience: 0
                }
            };
        }
        return entity;
    }

    _accept() {
        social.party_accept(event => {
            social.party_list(event => {
                this.members = [];
                for (let member of event.members) {
                    if (member !== application.token.domain) {
                        this.members.push(member);
                    }
                    this.render();
                }
            });

        }, this.invite.partyId);
        this._hide();
    }

    _decline() {
        social.party_decline(event => {
            this.invite = {};
        }, this.invite.partyId);
        this._hide();
    }

    _show() {
        this.container.style.display = 'block';
        input.block();
    }

    _hide() {
        this.container.style.display = 'none';
        input.unblock();
    }

    _index(index) {
        return `z-index: ${10 - index};`;
    }

    _loaded() {
        return (typeof this.realm !== 'undefined');
    }

    get template() {
        return html`
        <style>
            :host {
                display: block;
            }
            
            ${BunnyStyles.noselect}
            ${BunnyStyles.dialogs}
            ${BunnyStyles.icons}

            .container {
                position: absolute;
                top: 156px;
                left: 32px;
                display: flex;
                flex-direction: column;
                z-index: 400;
            }

            #dialog {
                min-width: 326px;
            }
            
            #dialog-content {
                min-height: 192px;
            }

            .member {
                position: relative;
                margin-bottom: 16px;
                top: 0;
                left: 0;
            }

            .invite-text {
                font-size: small;
                text-align: center;
                display: block;
                margin: 32px auto auto;
            }

            .response {
                display: flex;
                position: absolute;
                bottom: 0px;
                left: 0px;
                right: 0px;
            }

            .party-leave {
                display: block;
                position: absolute;
                left: -28px;
                top: -24px;
            }

            .dialog-container {
                display: none;
            }
            
            bunny-button {
                width: 100%;
            }
        </style>

        <div class="dialog-container" id="container">
            <div class="dialog-overlay"></div>

            <bunny-box class="noselect dialog-center" id="dialog">
                <div id="dialog-content">
                    <bunny-icon icon="close" class="icon" id="dialog-close" @mousedown="${this._decline.bind(this)}"></bunny-icon>
    
                    <span class="dialog-entity">Party invite</span>
    
                    <span class="invite-text">From ${this.invite.from}, do you accept? ${this.remaining}s</span>
    
                    <div class="response">
                        <bunny-button @click="${this._decline.bind(this)}">DECLINE</bunny-button>
                        <bunny-button primary raised @click="${this._accept.bind(this)}">ACCEPT</bunny-button>
                    </div>
                </div>
            </bunny-box>

        </div>

        <div class="container">
            ${this._inParty() ? html`
                <bunny-icon icon="close" class="icon party-leave" @mousedown="${this._leave.bind(this)}"></bunny-icon>
            ` : ''}

            ${repeat(this.members, member => member.id, (member, index) => html`
                <player-status .target="${this._member(member)}" class="member" style="${this._index(index)}" compact></player-status>
            `)}
        </div>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    bind() {
        this.container = this.query('.dialog-container');
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }
}

customElements.define(PartyView.is, PartyView);