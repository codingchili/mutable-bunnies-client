import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from '/node_modules/lit-html/directives/repeat.js';

import {BunnyStyles} from "/component/styles.js";
import '/component/bunny-icon.js'
import '/component/bunny-input.js'
import '/component/bunny-box.js'

class ChatBox extends HTMLElement {

    static get is() {
        return 'chat-box';
    }

    constructor() {
        super();
        this.list = {
            scrollTop: -1,
            scrollHeight: -1
        }
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        this.MAX_MESSAGES = 64;
        this.messages = [{
            system: true,
            text: `Server version ${patch.version} ${patch.name}.`
        }];

        application.onGameLoaded((game) => {
            this.game = game;
            this.channel = 'say';
            this._setHandler();
        });

        this._minimize();
    }

    get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                .chat-button {
                    position: absolute;
                    bottom: 16px;
                    left: 16px;
                }
                
                .chat-box {
                    position: absolute;
                    width: 416px;
                    height: 246px;
                    z-index: 600;
                }

                @media (min-width: 1281px) {
                    .chat-box {
                        bottom: 16px;
                        left: 16px;
                        right: unset;
                    }
                }
                
                @media (max-width: 1280px) {
                    .chat-button {
                        bottom: 70px;
                        top: unset;
                        right: 0;
                        left: 0;
                        margin: auto;
                        width: 32px;
                    }
                }
                
                @media (min-width: 869px) and (max-width: 1280px) {
                    .chat-box {
                        bottom: 70px;
                        left: 0;
                        right: 0;
                        margin: auto;
                    }
                }

                @media (max-width: 868px), (max-height: 400px) {
                    .chat-box {
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        width: unset;
                        height: unset;
                    }
                }

                .input {
                    position: absolute;
                    display: block;
                    bottom: 2px;
                    left: 0px;
                    right: 16px;
                }

                .messages {
                    list-style-type: none;
                    font-size: 14px;
                    margin-left: 8px;
                    margin-top: 2px;
                    padding-left: 0px;
                    margin-bottom: 0px;
                }

                .system {
                    color: #ffc200;
                }

                .party {
                    color: #2bc7ff;
                }

                .private {
                    color: #ff0085;
                }

                .hide-chat {
                    position: absolute;
                    right: 8px;
                    top: 8px;
                }

                .chat-icon {
                    display: block;
                    margin: 2px auto auto;
                    padding: 4px 4px 2px;
                }

                #list {
                    margin-top: 8px;
                    overflow-y: scroll;
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 48px;
                }

                .text {
                    word-break: break-word;
                    text-indent: -3em;
                    padding-left: 3em;
                    /*white-space: pre-wrap;*/
                }

                ${BunnyStyles.icons}
                ${BunnyStyles.scrollbars}

            </style>

            ${!this.minimized ? html`
                <bunny-box touchstart="${e => e.stopPropagation()}" class="chat-box" border>
                    <div>
                        <bunny-icon @mousedown="${this._minimize.bind(this)}"
                                    @touchstart="${this._minimize.bind(this)}"
                                    style="z-index: 701"
                                    class="hide-chat"
                                    icon="close">
                        </bunny-icon>

                        <div id="list">
                            <ul class="messages">
                                ${repeat(this.messages, message =>
                                        html`
                                            <li class="text ${this._system(message)} ${this._party(message)} ${this._private(message)}">
                                                ${this._name(message)}${message.text}
                                            </li>
                                        `)}
                            </ul>
                        </div>
                        <bunny-input id="message" class="input" maxlength="128"
                                     @input="${this._input.bind(this)}"
                                     @touchstart="${e => e.stopPropagation()}"
                                     placeholder="${this.channel}"
                                     @keydown="${this.submit.bind(this)}">
                        </bunny-input>
                    </div>

                </bunny-box>` : ''}

            ${this.minimized ? html`
                <bunny-box class="chat-button" border
                           @touchstart="${e => e.stopPropagation()}"
                           @mousedown="${this._maximize.bind(this)}">
                    <bunny-icon class="chat-icon" icon="chat"></bunny-icon>
                </bunny-box>
            ` : ''}
        `;
    }

    _minimize(e) {
        this.minimized = true;
        this.render();
        e?.stopPropagation();
    }

    _maximize() {
        this.minimized = false;
        this.render();

        this.input.addEventListener('blur', () => input.unblock(), true);
        this.input.addEventListener('focus', () => input.block(), true);

        setTimeout(() => {
            this._focus();
        }, 1);
    }

    _input() {
        this.input.value = emojify(this.input.value);

        if (this.input.value === '/s') {
            this.channel = 'say';
            this.input.clear();
            this.render();
        }
        if (this.input.value === '/p') {
            this.channel = 'party';
            this.input.clear();
            this.render();
        }
    }

    _setHandler() {
        game.chat.onChatMessage(msg => this.add(msg));
        input.onKeyDown(() => this._focus(), 'enter');
    }

    _focus() {
        let message = this.shadowRoot.querySelector('#message');
        if (this.shadowRoot.activeElement !== message) {
            message.focus();
        }
    }

    _system(message) {
        return (message.system) ? 'system' : '';
    }

    _party(message) {
        return (message.party) ? 'party' : '';
    }

    _private(message) {
        return (message.private) ? 'private' : '';
    }

    _formatNumbers(text) {
        for (let match of text.matchAll(/[0-9]+/g)) {
            console.log(match[0]);
            text = text.replace(match[0], parseInt(match[0]).toLocaleString());
        }
        return text;
    }

    send() {
        let message = this._formatNumbers(emojify(this.input.value));

        if (message.length !== 0) {
            if (this.channel === 'party') {
                social.party_message(() => {
                    //
                }, message.replace('/p', ''));
            } else {
                game.chat.send(message);
            }
            this.input.clear();
            this.render();
        } else {
            setTimeout(() => this.query('#message').blur());
        }
    }

    add(message) {
        if (message.text) {
            // check if scrolled to bottom, otherwise don't auto scroll. (account for weird rounding on mobile)
            let scroll = Math.abs((this.list.scrollTop + this.list.clientHeight) - this.list.scrollHeight) < 10;
            this.messages.push(message);
            if (scroll) {
                setTimeout(() => this.list.scrollTop = Number.MAX_SAFE_INTEGER, 0);
            }
        }
        while (this.messages.length >= this.MAX_MESSAGES) {
            this.messages.splice(0, 1);
        }
        this.render();
    }

    _name(message) {
        if (message.source && !message.system) {
            if (message.party) {
                return `${message.source}: `;
            } else {
                if (message.name) {
                    return `${message.name}: `;
                } else {
                    message.name = game.lookup(message.source).name;
                    return `${message.name}: `;
                }
            }
        } else {
            return '';
        }
    }

    submit(event) {
        if (event.key === 'Enter')
            this.send();
        if (event.key === 'Escape') {
            this.query('#message').blur();
        }
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
        this.input = this.query("#message");
        let list = this.query('#list');
        if (list) {
            this.list = list;
        }
    }
}

customElements.define(ChatBox.is, ChatBox);