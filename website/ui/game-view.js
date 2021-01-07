import {html, render} from '/node_modules/lit-html/lit-html.js';

import './game/notification-toaster.js'
import './game/player-status.js'
import './game/spell-bar.js'
import './game/chat-box.js'
import './game/game-menu.js'
import './game/context-menu.js'
import './game/game-dialog.js'
import './game/game-settings.js'
import './game/death-dialog.js'
import './game/player-inventory.js'
import './game/player-spells.js'
import './game/loot-dialog.js'
import './game/friend-view.js'
import './game/player-skills.js'
import './game/quest-log.js'
import './game/party-view.js'
import './game/world-designer.js'


class GameView extends HTMLElement {

    static get is() {
        return 'game-view';
    }

    constructor() {
        super();
        this.target = false;

        application.onGameLoaded(() => {
            game.subscribe('character-update', character => {
                if (character === game.player) {
                    this.player = character;
                    this.render();
                }
            });

            game.subscribe('character-target', character => {
                this.target = character;
                this.render();
            });

            game.subscribe('creature-despawn', creature => {
                if (creature.id === this.target.id) {
                    this.target = false;
                    this.render();
                }
            })
        });

        application.onCompleteUpdate((event) => {
            this.loading = true;
            event.status('Initializing..');

            window.onScriptsLoaded = () => {
            };
            try {
                let index = 0;

                // serializes loading of scripts.
                let loader = (index) => {
                    if (index < event.patch.executable.length) {
                        let script = event.patch.executable[index];
                        event.status('init ' + script.split('.')[0]);

                        if (event.patch.files[script]) {
                            try {
                                // indirect eval for global scope.
                                (1, eval)(event.patch.files[script].data);
                                index++;
                                loader(index);
                            } catch (err) {
                                this._handleError(err);
                            }
                        } else {
                            application.error('Bootstrap script not downloaded: "' + script + '".');
                        }
                    } else {
                        event.status('Joining server..');

                        application.scriptsLoaded();
                        window.game.onScriptsLoaded({
                            accepted: () => {
                                // use the patching UI for loading the game scripts.
                                game.display();
                                application.showGame();
                                this.loaded();
                            },
                            error: (msg) => {
                                this._handleError(new Error(msg));
                            }
                        });
                    }
                };
                loader(index);
            } catch (err) {
                this._handleError(err);
            }
        });
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
    }

    get template() {
        return html`
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    margin-bottom: -3px;
                    padding: 0;
                }

                @keyframes fadein {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                #interface {
                    animation: fadein 0.72s ease 1;
                    position: absolute;
                    z-index: 100;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                #interface * {
                    pointer-events: all;
                }

            </style>
            <div id="interface">
                <notification-toaster></notification-toaster>
                    <!--<div ?hidden="${this.loading}">-->

                <game-settings></game-settings>
                <game-dialog></game-dialog>
                
                <quest-log></quest-log>
                <loot-dialog></loot-dialog>
                <death-dialog></death-dialog>
                
                <player-inventory></player-inventory>
                <player-skills></player-skills>
                <player-spells></player-spells>
                
                <friend-view></friend-view>

                <player-status .target="${this.target}" style="right: 16px; left: unset;"
                               ?hidden="${!this.target}"></player-status>

                <!-- player -->
                <player-status .target="${this.player}"></player-status>

                <party-view></party-view>

                <chat-box></chat-box>
                <spell-bar></spell-bar>
                <world-designer></world-designer>
                <game-menu></game-menu>
                <context-menu></context-menu>
                <!--</div>-->
            </div>
        `;
    }

    loaded() {
        this.loading = false;
        this.target = false;
        this.render();
    }

    _handleError(err) {
        application.error(err.message);
        throw err;
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(GameView.is, GameView);