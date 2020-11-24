import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from "../../component/styles.js";
import '/node_modules/ink-ripple/ink-ripple.js';

import '/component/bunny-box.js'
import '/component/bunny-input.js'
import '/component/bunny-icon.js'

class FriendView extends HTMLElement {

    static get is() {
        return 'friend-view';
    }

    constructor() {
        super();
        this.chat = false;
        this.list = [];
        this.pending = [];
        this.requests = [];
        this.suggestions = [];
        this.online = {};
        this.messages = {};
        this.thread = [];
        this.unread = {};
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        application.onGameLoaded(() => {
            input.onKeysListener({
                down: () => {
                    application.publish('show-friends');
                }
            }, 'j');

            this._listen();
        });

        application.subscribe('show-friends', () => {
            import('../../script/service/social.js').then(() => {
                if (this._open()) {
                    this._hide();
                } else {
                    this._pending();
                    this._list();

                    this.suggestions = [];

                    this._show();
                }
            });
        });
    }

    _unread(friend) {
        this.unread[friend] = this.unread[friend] || 0;
        let unread = this.unread[friend];
        return (unread > 0) ? unread : '';
    }

    _listen() {
        server.connection.setHandler('friend_message', event => {
            if (!this.messages[event.from]) {
                this.messages[event.from] = [];
            }

            this.messages[event.from].push(event);

            if (this.chat !== event.from) {
                this.unread[event.from] = (this.unread[event.from] || 0) + 1
            } else {
                this._scroll();
            }

            if (!this._open()) {
                game.chat.add({text: `${event.from}: ${event.message}`, private: true});
            } else {
                this.render();
            }
        });

        server.connection.setHandler('social_offline', event => {
            this.online[event.friend] = (this.online[event.friend] || [])
                .filter(function (value, index, arr) {
                    return value !== event.realm;
                });
            this._sort();
            this.render();
        });

        server.connection.setHandler('social_online', event => {
            application.publish('notification', `${event.friend} is now online.`);
            this.online[event.friend] = this.online[event.friend] || [];
            this.online[event.friend].push(event.realm);
            this._sort();
            this.render();
        });
    }

    _locality(friend) {
        let realms = this.online[friend];
        if (realms && realms.length > 0) {
            return (realms.includes(application.realm.id)) ? 'lime' : 'orange';
        } else {
            return 'red';
        }
    }

    _description(friend) {
        let realms = this.online[friend];
        if (realms && realms.length > 0) {
            return ((realms.includes(application.realm.id)) ? [application.realm.id] : realms.join(", "))
                .map(realm => realm.replace('_', ' '));
        } else {
            return "offline";
        }
    }

    _findFriends() {
        this.chat = false;
        this.render();
        this.friend.focus();
    }

    _direction(message) {
        return (message.from === application.token.domain) ? 'from' : 'to';
    }

    _online(friend) {
        return (this.online[friend]);
    }

    _chat(friend) {
        if (this._online(friend)) {
            this.chat = friend;
            this.unread[this.chat] = 0;

            if (!this.messages[this.chat]) {
                this.messages[this.chat] = [];
            }
            this.thread = this.messages[this.chat];
            this.render();
            this.message.focus();
            this._scroll();
        }
    }

    _scroll() {
        setTimeout(() => {
            try {
                let element = this.shadowRoot.querySelector('#messages');
                element.scrollTop = element.scrollHeight;
            } catch (e) {
                // do nothing.
            }
        }, 1);
    }

    _list() {
        social.friend_list(event => {
            this.list = event.friends;
            this.requests = event.requests;
            this.online = event.online;
            this._sort();
            this.render();
        });
    }

    _pending() {
        social.friend_pending(event => {
            this.pending = event.pending;
            this.render();
        });
    }

    _accept(request) {
        social.friend_accept(event => {
            this.list = event.friends;
            this.requests = event.requests;
            this._sort();
            this._pending();
        }, request);
    }

    _hasRequests() {
        return this.requests.length > 0;
    }

    _hasPending() {
        return this.pending.length > 0;
    }

    _hasFriends() {
        return this.list.length > 0;
    }

    _hasSuggestions() {
        return this.suggestions.length > 0;
    }

    _reject(request) {
        social.friend_reject(event => {
            this._list();
        }, request);
    }

    _keydown(e) {
        if (e.keyCode === 13) {
            this._request();
        }
    }

    _requestSuggested(event) {
        let friend = this.friend.value;
        if (friend.length >= 1) {
            social.friend_suggestion(event => {
                //this.suggestions = event.suggestions;
                this.suggestions = ['admin', 'poobear', 'bunny', 'mutable', 'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'black', 'red', 'orange', 'soft', 'hard', 'round', 'sharp', 'fast', 'slow'];
                this.render();
            }, friend);
        } else {
            this.suggestions = [];
            this.render();
        }
    }

    _requestFromSuggested(suggestion) {
        this._sendRequest(suggestion);
        this.render();
        this.friend.focus();
    }

    _request() {
        let friend = this.friend.value;
        if (friend.length > 0) {
            this._sendRequest(friend);
            this.friend.clear();
        }
    }

    _sendRequest(target) {
        social.friend_request(event => {
            application.publish('notification', `Friend request sent to ${target}.`);
            this._pending();
        }, target);
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

    _message() {
        let message = this.message.value;

        if (message.length > 0) {
            social.friend_message((e) => {
                this.thread.push({
                    message: message,
                    from: application.token.domain,
                    to: this.chat
                });
                this.message.clear();
                this.render();
                this._scroll();
            }, this.chat, message);
        }
    }

    _sendMessage(e) {
        if (e.keyCode === 13) {
            this._message();
        }
    }

    get template() {
        return html`
        <style>
            :host {
                display: block;
            }
            
            ${BunnyStyles.dialogs}
            ${BunnyStyles.icons}
            ${BunnyStyles.noselect}
            ${BunnyStyles.scrollbars}
            ${BunnyStyles.variables}
            ${BunnyStyles.hr_wide}

            #dialog {
                width: 624px;
                min-width: 428px;
                max-width: 624px;
                min-height: 376px;
                max-height: 376px;
            }

            span {
                padding: 0.28rem;
            }

            .friend-item {
                position: relative;
                padding: 2px;
                font-size: small;
                display: flex;
                justify-content: space-between;
            }

            .highlight {
                border: 1px solid var(--game-theme);            
            }

            #friends {
                width: 192px;
                overflow-y: scroll;
                position: absolute;
                bottom: 0px;
                top: 52px;
            }

            .add-icon {
                top: 18px;
                right: 0px;
                position: absolute;
            }

            .add-area {
                position: absolute;
                left: 198px;
                right: 8px;
                bottom: 0px;
                top: 54px;
            }
            
            .friend-name {
                padding: 8px;
                display: block;
            }

            .add-controls {
                display: flex;
                flex-direction: row;
                justify-content: center;
            }

            .suggestion-title {
                text-align: center;
                display: block;
            }

            .add-input {
                width: 100%;
            }

            .message {
                width: 60%;
                padding: 8px;
                margin: 4px;
                font-size: smaller;
            }

            .sender {
                display: block;
                font-size: x-small;
                text-align: right;
                padding: 0;
            }
            
            .border {
                border: 1px solid var(--game-theme-opaque);
                border-radius: 2px;
            }

            .to {
                margin-left: 34%;
            }

            .suggestions {
                margin-top: 8px;
                overflow-y: scroll;
                position: absolute;
                bottom: 0px;
                top: 60px;
                width: 100%;
                overflow-y: scroll;
            }
            
            #container {
                display: none;
            }

            .actions {
                position: absolute;
                display: flex;
                flex-direction: row;
                right: 8px;
                top: 6px;
                z-index: 200;
            }

            .close-chat {
                top: 20px;
                left: 6px;
                position: absolute;
            }

            .send-icon {
                display: block;
                margin-top: 24px;
            }

            #message {
                width: 100%;
                margin-left: 42px;
                margin-right: 32px;
                display: block;
            }

            #messages {
                overflow-y: scroll;
                overflow-x: hidden;
                word-break: break-word;
                position: absolute;
                top: 0px;
                bottom: 48px;
                right: 8px;
                left: 0px;
            }

            #message-send {
                position: absolute;
                bottom: -4px;
                right: 8px;
                left: 0px;
            }

            #send-controls {
                display: flex;
            }
            
            #dialog-content {
                min-height: 376px;
            }
            
            .thread-unread {
                margin-top: 4px;
                margin-right: 4px;
                display: block;
            }

            .thread-container {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }
            
            .icon-selected > svg {
                display: block;
                fill: var(--icon-color);
                width: 20px;
                height: 20px;
                margin-top: 4px;
            }

        </style>

        <div class="dialog-container" id="container">
            <div class="dialog-overlay"></div>

            <bunny-box class="noselect dialog-center" id="dialog">
            <div id="dialog-content">
                <bunny-icon icon="close" class="icon" id="dialog-close" @mousedown="${this._hide.bind(this)}"></bunny-icon>

                <span class="dialog-entity">Friends</span>

                <hr>
                <div id="friends">
                
                    ${this.list.map(friend =>
                        html`
                            <bunny-box @click="${this._chat.bind(this, friend)}" class="friend-item"
                                            style="color:${this._locality(friend)};">
                                                                
                                <div class="thread-container">  
                                    <span class="friend-name">${friend}</span>
                                    <div>
                                        ${this._online(friend) && this._unread(friend) > 0 ? html`
                                            <span class="thread-unread">${this._unread(friend)}</span>
                                        ` : ''}
                                        
                                        ${this.chat === friend ? html`
                                            <bunny-icon icon="chat" class="icon icon-selected"></bunny-icon>
                                        ` : ''}
                                        
                                        <ink-ripple></ink-ripple>
                                    </div>
                                </div>
                            </bunny-box>
                            <bunny-tooltip class="tooltip" location="bottom">
                                ${this._description(friend)}
                            </bunny-tooltip>`
                        )}

                    <hr>

                    <div ?hidden="${!this._hasRequests()}">
                        <span>Incoming</span>

                        ${this.requests.map((request) => html`
                            <bunny-box class="friend-item">
                                <div>
                                    <span class="friend-name">${request}</span>
    
                                    <div class="actions">
                                        <bunny-icon icon="done" class="icon" @click="${this._accept.bind(this, request)}"></bunny-icon>
                                        <bunny-icon icon="close" class="icon" @click="${this._reject.bind(this, request)}"></bunny-icon>
                                    </div>
    
                                    <ink-ripple></ink-ripple>
                                </div>
                            </bunny-box>
                        `)}

                        <hr>
                    </div>

                    <div ?hidden="${!this._hasPending()}">
                        <span>Pending</span>

                        ${this.pending.map((pendant) => html`
                            <bunny-box class="friend-item">

                                <span class="friend-name">${pendant}</span>
                                <div class="actions">
                                    <!-- no support for canceling requests yet. -->
                                    <!--<iron-icon icon="icons:close" class="action-icon" on-tap="_cancel"></iron-icon>-->
                                </div>

                                <ink-ripple></ink-ripple>
                            </bunny-box>
                        `)}
                    </div>
                </div>

                <div class="add-area">

                    <div ?hidden="${this.chat}">
                        <div class="add-controls">
                            <bunny-input id="friend" label="Add Friend" @input="${this._requestSuggested.bind(this)}"
                                         @keydown="${this._keydown.bind(this)}"
                                         type="text" class="add-input" autofocus></bunny-input>

                            <bunny-icon icon="send" class="icon add-icon" @click="${this._request.bind(this)}"></bunny-icon>
                        </div>

                        <div ?hidden="${!this._hasSuggestions()}">
                            <div class="suggestions">
                                <span class="suggestion-title">Suggestions</span>
                                ${this.suggestions.map(suggestion => html`
                                    <bunny-box class="friend-item" @click="${this._requestFromSuggested.bind(this, suggestion)}">
                                        <div>
                                            <span class="friend-name">${suggestion}</span>
                                        </div>
                                        <ink-ripple></ink-ripple>
                                    </bunny-box>
                                `)}
                            </div>
                        </div>
                    </div>


                    <div ?hidden="${!this.chat}">
                        <div id="messages">
                            ${this.thread.map(message => html`
                                <div class="message border ${this._direction(message)}">
                                    <span class="sender">${message.from}</span>
                                    ${message.message}
                                </div>
                            `)}
                        </div>

                        <div id="message-send">
                            <div id="send-controls">
                                <bunny-icon icon="back" class="icon close-chat" @mousedown="${this._findFriends.bind(this)}"></bunny-icon>
                                <bunny-input id="message" label="Message"
                                             @keydown="${this._sendMessage.bind(this)}"
                                             type="text" class="add-input" autofocus></bunny-input>

                                <bunny-icon icon="send" class="icon send-icon" @mousedown="${this._message.bind(this)}"></bunny-icon>
                            </div>
                        </div>
                    </div>

                </div>
                </div>
            </bunny-box>
        </div>
        `;
    }

    _sort() {
        // online status => name.
        this.list = this.list.sort((a, b) => {
            if (this._online(a) === this._online(b)) {
                return a.localeCompare(b);
            } else {
                if (this._online(a)) {
                    return -1;
                } else if (this._online(b)) {
                    return 1;
                } else {
                    return 0;
                }
            }
        })
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
        this.friend = this.query('#friend');
        this.message = this.query('#message');
    }
}

customElements.define(FriendView.is, FriendView);