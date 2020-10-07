import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from 'lit-html/directives/repeat.js';

import {BunnyStyles} from "/component/styles.js";
import '/component/bunny-icon.js'
import '/component/bunny-input.js'
import '/component/bunny-box.js'
import '/component/bunny-icon.js'

class ChatBox extends HTMLElement {

    static get is() {
        return 'chat-box';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})

        this.MAX_MESSAGES = 14;
        this.listeners = false;
        this.minimized = true;

        this.messages = [{
            system: true,
            text: `Server version ${patch.version} ${patch.name}.`
        }];

        application.onGameLoaded(() => {
            this.channel = 'say';
            this._setHandler();
        });

        this.render();
    }

    get template() {
        return html`
        <style>
            :host {
                display: block;
                position: absolute;
                bottom: 16px;
                left: 16px;
            }

            .chat-box {
                width: 416px;
                height: 246px;
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
                font-size: smaller;
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

            @media (max-width: 1268px) {
                :host {
                    bottom: 64px;
                    height: 47px;
                    display: block;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .chat-box {
                    bottom: 36px;
                    position: absolute;
                    transform: translateX(-50%);
                }
            }

            .hide-chat {
                position: absolute;
                right: 8px;
                top: 8px;
            }

            .chat-icon {
                display: block;
                margin: auto;
                padding: 4px;
                margin-top: 2px;
                padding-bottom: 2px;
            }

            .list {
                margin-top: 8px;
            }
            
            ${BunnyStyles.icons}

        </style>

        ${!this.minimized ? html`
            <bunny-box class="chat-box" border>
                <div>
                    <bunny-icon @mousedown="${this._minimize.bind(this)}" class="hide-chat" icon="close"></bunny-icon>
    
                    <div class="list">
                        <ul class="messages">
                            ${repeat(this.messages, message =>
                                html`
                                    <li class="text ${this._system(message)} ${this._party(message)} ${this._private(message)}">
                                        ${this._name(message)}${message.text}
                                    </li>                        
                            `)}
                        </ul>
                    </div>
                    <bunny-input id="message" class="input" @input="${this._input.bind(this)}" maxlength="60"
                                 placeholder="${this.channel}"
                                 @keydown="${this.submit.bind(this)}"></bunny-input>
               </div>

            </bunny-box>` : ''}

        ${this.minimized ? html`
            <bunny-box class="chat-button" @mousedown="${this._maximize.bind(this)}" border>
                    <bunny-icon class="chat-icon" icon="chat"></bunny-icon>
            </bunny-box>
        `: ''}
        `;
    }

    _minimize() {
        this.minimized = true;
        this.render();
    }

    _maximize() {
        this.minimized = false;
        this.render();

        setTimeout(() => {
            this._focus();
        }, 1);
    }

    _input() {
        let message = this.input.value;

        if (message === '/s') {
            this.channel = 'say';
            this.input.clear();
            this.render();
        }
        if (message === '/p') {
            this.channel = 'party';
            this.input.clear();
            this.render();
        }
    }

    _setHandler() {
        game.chat.onChatMessage(msg => {
            this.add(msg);
        });

        input.onKeysListener({
            down: () => {
                this._focus();
            }
        }, ['Enter']);

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

    send() {
        let message = this.input.value;

        if (message.length !== 0) {
            if (this.channel === 'party') {
                social.party_message(() => {
                    //
                }, message.replace('/p', ''));
            } else {
                game.chat.send(message);
            }
            this.input.clear();
            this.query('#message').blur();
            this.render();
        }
    }

    add(message) {
        if (message.text) {
            this.messages.push(message);
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
        if (!this.listeners) {
            this.query('#message').addEventListener('blur', () => {
                input.unblock();
            }, true);

            this.query('#message').addEventListener('focus', () => {
                input.block();
            }, true);

            input.block();
        }

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
    }
}

customElements.define(ChatBox.is, ChatBox);