import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from "../component/styles.js";
import '/component/bunny-pages.js'
import '/component/bunny-bar.js'
import '/component/bunny-icon.js'
import '/component/bunny-box.js'
import './page-start.js'
import './page-login.js'
import './game-realms.js'
import './game-characters.js'
import './patch-download.js'
import './offline-view.js'

class AppView extends HTMLElement {

    static get is() {
        return 'app-view';
    }

    constructor() {
        super();
        this.authenticated = false;
        this.music = application.settings.music;
    }

    get template() {
        return html`
            <style>
                ${BunnyStyles.variables}
                ${BunnyStyles.icons}
                :host {
                    display: block;
                    background-image: url("images/background_graveyard.webp");
                    background-repeat: repeat-x;
                    background-attachment: fixed;
                    width: 100%;
                    min-height: 100vh;
                }

                #toolbar {
                    z-index: 100;
                }

                error-dialog {
                    z-index: 800;
                }

                #footer {
                    z-index: 100;
                }

                .icon-mute, .icon-sound {
                    width: 32px;
                    height: 32px;
                    max-width: 32px;
                    max-height: 32px;
                }

                #options {
                    position: absolute;
                    bottom: 58px;
                    right: 24px;
                    padding: 0;
                    margin: 0;
                    height: 32px;
                }
            </style>

            ${this.game ? '' : html`
                <bunny-bar id="toolbar" location="top">
                    <div slot="left" class="icon" ?hidden="${this.authenticated}">
                        <bunny-icon @mousedown="${this._home.bind(this)}" icon="home">
                    </div>
                    <div id="banner" slot="text"></div>
                    ${this.authenticated ? html`
                        <div slot="right" class="icon" @mousedown="${this._logout.bind(this)}">
                            <bunny-icon icon="close"></bunny-icon>
                        </div>
                    ` : ''}
                </bunny-bar>
            `}
            
            <bunny-pages part="pages">
                <div slot="tabs"></div>
                <div slot="pages">
                    <page-start part="start" class="layout horizontal center-justified"></page-start>
                    <page-login part="login" class="layout horizontal center-justified"></page-login>
                    <game-realms part="realms" class="layout horizontal center-justified"></game-realms>
                    <game-characters part="characters" class="layout horizontal center-justified"></game-characters>
                    <patch-download part="download" class="layout horizontal center-justified"></patch-download>
                    <game-view part="game"></game-view>
                    <offline-view part="offline" class="layout horizontal center-justified"></offline-view>
                </div>
            </bunny-pages>

            <div id="error-dialog">
                <error-dialog></error-dialog>
            </div>

            ${this.game ? '' : html`
                <bunny-box id="options">
                    ${this.music ?
                            html`
                                <bunny-icon icon="sound" @mousedown="${this._music.bind(this, false)}"></bunny-icon>` :
                            html`
                                <bunny-icon icon="mute" @mousedown="${this._music.bind(this, true)}"></bunny-icon>`
                    }
                </bunny-box>`
            }

            ${this.game ? '' : html`
                <bunny-bar id="footer" location="bottom">${this.version}</bunny-bar>`}
        `;
    }

    connectedCallback() {
        let start = (window.isPWA || application.development.skipStart) ? 'page-login' : 'page-start';

        application.onError((e) => {
            import('./error-dialog.js').then(() => {
                customElements.whenDefined('error-dialog').then(() => {
                    this.render();
                    this.shadowRoot.querySelector('error-dialog').open(e);
                });
            });
        });

        this.setupAmbientAudio();

        application.onVersion(patch => {
            this.version = `${patch.name} ${patch.version}`
            this.render();
        });

        application.onLogout(() => {
            this.authenticated = false;
            this.render();
        });

        application.onAuthentication(() => {
            this.authenticated = true;
            this.render();
        });

        application.subscribe('view', (view) => {
            window.scrollTo(0, 0);
            this.setView(view);
        });

        this.banner();
        this.attachShadow({mode: 'open'});
        this.render();

        customElements.whenDefined('bunny-pages').then(() => {
            if (!application.offline) {
                application.publish('view', start)
            } else {
                application.showOffline();
            }
        });
    }

    banner() {
        fetch('/data/banner.json')
            .then(response => response.json())
            .then(json => {
                this.shadowRoot.querySelector('#banner').textContent = json.text;
            })
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    _home() {
        application.view('page-start');
    }

    _music(enabled) {
        this.music = enabled;
        (enabled) ? this.play() : this.pause();
        application.settings.music = enabled;
        this.render();
    }

    _logout() {
        if (window.isPWA) {
            document.exitFullscreen();
        }
        application.logout();
    }

    setView(view) {
        let pages = this.shadowRoot.querySelector('bunny-pages');
        this.game = (view === 'game-view');

        view = this.shadowRoot.querySelector(view);
        pages.show(view);
        this.render();
    }

    setupAmbientAudio() {
        application.onAuthentication(() => {
            this.play();
        });

        application.onLogout(() => {
            this.ambient.pause();
        });

        application.onScriptShutdown(() => {
            if (this.ambient) {
                this.ambient.currentTime = 0;
                this.play();
            }
        });
        application.onScriptsLoaded(this.pause.bind(this));

        application.onSettingsChanged(settings => {
            if (this.ambient) {
                this.ambient.volume = settings.music;
            }
        });
    }

    play() {
        if (!this.ambient) {
            this.ambient = new Audio('/sound/mutable_theme.mp3');
            this.ambient.loop = true;
            this.ambient.volume = application.settings.music;

            this.ambient.addEventListener('loadeddata', () => {
                this.play();
            });
        } else {
            if (this.music) {
                this.ambient.play();
            }
        }
    }

    pause() {
        if (this.ambient) {
            this.ambient.pause();
        }
    }
}

window.customElements.define(AppView.is, AppView);