import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '/component/styles.js';
import '/component/bunny-box.js';
import '/component/bunny-button.js';
import '/component/bunny-tab.js';
import '/component/bunny-pages.js';
import '/component/page-game.js';

class StartPage extends HTMLElement {

    static get is() {
        return 'start-page';
    }

    get template() {
        return html`
            <style>
                :host {
                    display: block;
                    padding-top: 128px;
                    padding-bottom: 64px;
                }

                .container {
                    width: 80%;
                    max-width: 825px;
                    margin: auto;
                    display: block;
                }

                .install-link {
                    display: block;
                    text-align: center;
                    padding: 16px;
                    font-size: 12px;
                }

                @media (max-width: 728px) {
                    :host {
                        padding-top: 36px;
                        padding-bottom: 18px;
                    }

                    .container {
                        width: 100%;
                    }
                }
                
                div[slot="tabs"] {
                    display:flex;
                    flex-flow: row nowrap;
                    justify-content: space-around;  
                    align-items: stretch;
                }
                
                ${BunnyStyles.links}

            </style>

            <div>
                <bunny-box class="container center-box" elevation="3">

                    <bunny-pages class="page-content">
                        <div slot="tabs">
                            <bunny-tab active>Mutable Bunnies</bunny-tab>
                            <bunny-tab>News</bunny-tab>
                            <bunny-tab>Patch notes</bunny-tab>
                        </div>
                    
                        <div slot="pages">
                            <bunny-box elevation="0">
                                <page-game></page-game>
                            </bunny-box>
                            <bunny-box elevation="0">
                                <page-news></page-news>
                            </bunny-box>
                            <bunny-box elevation="0">
                                <page-patchnotes></page-patchnotes>
                            </bunny-box>
                        </div>
                    </bunny-pages>

                    
                    <a id="install-link" href="#" class="install-link" onclick="this.getRootNode().host._install()">install to desktop</a>                
                    <bunny-button primary class="flex" onclick="this.getRootNode().host.start()">TAKE ME ON AN ADVENTURE</bunny-button>
                </bunny-box>
            </div>
        `;
    }

    connectedCallback() {
        this.installed = !(window.pwa);
        this.page = 0;

        application.subscribe('installed', installed => {
            console.log('installed? = ' + installed);
            this.installed = installed;
            if (this.installed) {
                this.link.style.display = 'none';
            }
        });

        this.attachShadow({mode: 'open'});
        render(this.template, this.shadowRoot);

        this.link = this.shadowRoot.querySelector('#install-link');
    }

    start() {
        application.showLogin();
    }

    _install() {
        window.pwa.prompt();
        window.pwa.userChoice
            .then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    application.publish('installed', true);
                    application.view('game-login');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                window.pwa = null;
            });
    }
}

window.customElements.define(StartPage.is, StartPage);