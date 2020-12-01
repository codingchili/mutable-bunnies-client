import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js';

import {BunnyStyles} from "../../component/styles.js";

import '/component/bunny-box.js'
import '/component/bunny-icon.js'

class QuestLog extends HTMLElement {

    static get is() {
        return 'quest-log';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
        this._clear();

        application.onGameLoaded(() => {
            this._clear();
        });

        application.subscribe('show-quests', () => {
            if (this._open()) {
                this._hide();
            } else {
                this._show();
            }
        });
    }

    _clear() {
        this.quests = [];
        this.quest = {};
        this.details = {
            entries: [],
            description: ""
        };
    }

    _selected(quest) {
        return (this.quest.id === quest.id)
    }

    _complete(entry) {
        return (entry.complete) ? 'quest-log-entry-complete' : '';
    }

    _details(quest) {
        this.quest = quest;

        game.quests.details((response) => {
            this.details = response;
            this.render();
        }, this.quest.id,);
    }

    _open() {
        this.render();
        input.block();
        return this.container.style.display === 'block';
    }

    _show() {
        this.container.style.display = 'block';
        game.quests.list(response => {
            this.quests = response.collection;
            this.quests.sort((a, b) => {
                if (a.completed === b.completed) {
                    return a.name.localeCompare(b.name);
                } else {
                    if (a.completed) {
                        return 1;
                    } else if (b.completed) {
                        return -1;
                    }
                }
            });

            if (this.quests.length > 0) {
                this._details({
                    model: {entry: this.quests[0]}
                })
            }

            this.render();
        });
    }

    _hide() {
        input.unblock();
        this.container.style.display = 'none';
    }

    get template() {
        return html`
        <style>
            :host {
            }

            #dialog {
                width: 624px;
                min-width: 428px;
                max-width: 624px;
            }
            
            #dialog-content {
                min-height: 376px;            
            }
            
            ${BunnyStyles.dialogs}
            ${BunnyStyles.scrollbars}
            ${BunnyStyles.icons}
            ${BunnyStyles.variables}
            ${BunnyStyles.hr_wide}

            span {
                padding: 0.28rem;
            }

            .quest-log {
                width: 36%;
                margin-top: 12px;
                overflow-y: scroll;
            }

            .quest-log-entry {
                padding: 2px;
                font-size: small;
                display: flex;
                justify-content: space-between;
            }

            .quest-log-entry:hover {
                color: var(--accent-color);
                cursor: var(--bunny-cursor-pointer);
            }
            
            .highlight {
                color: var(--accent-color);
            }

            .quest-log-entry-complete {
                text-decoration: line-through;
            }

            .quest-details {
                width: 64%;
                padding: 0 8px 8px;
                overflow-y: scroll;
                margin-right: 2px;
            }

            #quest-container {
                display: flex;
                position: absolute;
                bottom: 0px;
                top: 40px;
                width: 100%;
            }

            .entry-header {
                display: block;
            }

            .entry-body {
                font-size: smaller;
                display: block;
            }

            .quest-header {
                display: block;
            }

            .quest-description {
                font-size: smaller;
                display: block;
            }

            .done-icon:hover {
                color: white;
            }

            @media (max-width: 790px) {
                #dialog {
                    left: 0;
                    right: 0;
                    top: 3px;
                    bottom: 0;
                    transform: unset;
                    width: unset;
                    max-width: unset;
                }
            }
            
            .entry-content {
                position: relative;
                display: flex;
                justify-content: space-between;
                width: 100%;
            }

        </style>

        <div class="dialog-container" id="container">
            <div class="dialog-overlay"></div>

            <bunny-box class="noselect dialog-center" id="dialog">
                <div id="dialog-content">
                    <bunny-icon icon="close" class="icon" id="dialog-close" @mousedown="${this._hide.bind(this)}"></bunny-icon>
                    <span class="dialog-entity">Quest Log</span>
    
                    <div id="quest-container">
                        <!-- quest log -->
                        <div class="quest-log" elevation="3">
                            ${this.quests.map((quest) => html`
                                <div class="quest-log-entry" @mousedown="${this._details.bind(this, quest)}">
    
                                    <div class="entry-content">
                                        <span class="quest-name ${this.quest.id === quest.id ? 'highlight' : ''}">${quest.name}</span>
                                        ${quest.completed ? html`<bunny-icon class="icon" icon="done"></bunny-icon>` : ''}
        
                                        <ink-ripple></ink-ripple>
                                    </div>
                                </div>
                            `)}
                        </div>
    
                        <div class="quest-details">
                            <!--<span class="quest-header">[[quest.name]]</span>-->
                            <span class="quest-description">${this.details.description}</span>
                            <hr>
                            ${this.details.entries.map(entry => html`
                                <div>
                                    <span class="entry-header ${this._complete(entry)}"><i>${entry.name}</i></span>
                                    <span class="entry-body">${entry.description}</span>
                                </div>
                                <hr>
                            `)}
                        </div>
                    </div>
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

customElements.define(QuestLog.is, QuestLog);