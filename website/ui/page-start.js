import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '../component/styles.js';

import '/component/bunny-box.js';
import '/component/bunny-button.js';
import '/component/bunny-tab.js';
import '/component/bunny-pages.js';
import '/component/bunny-countdown.js';
import '/component/bunny-icon.js';

import './page-game.js';
import './page-news.js';
import './page-patch.js';

class PageStart extends HTMLElement {

    static get is() {
        return 'page-start';
    }

    get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                ${BunnyStyles.hr}
                ${BunnyStyles.scrollbars}
                ${BunnyStyles.links}
                ${BunnyStyles.icons}
                bunny-tab {
                    --bunny-tab-background-active: #00000000;
                    --bunny-tab-background: #00000000;
                }

                .container {
                    width: 90%;
                    max-width: 925px;
                    margin: auto;
                    display: block;
                    padding-bottom: 128px;
                }

                #install-link {
                    display: block;
                    text-align: center;
                    padding: 16px 16px 16px 16px;
                    text-shadow: 2px 2px #000;
                    font-size: 14px;
                }

                #install-link:hover {
                    text-decoration: none;
                    color: var(--accent-color);
                }

                @media (max-width: 868px) {
                    :host {
                        padding-bottom: 18px;
                    }

                    .container {
                        width: 100%;
                    }
                }

                #header {
                    position: relative;
                    height: 100vh;
                    overflow: hidden;
                }

                div[slot="tabs"] {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-around;
                    align-items: stretch;
                }

                #header-start-container {
                    width: 256px;
                    left: 0;
                    right: 0;
                    bottom: 0px;
                    position: absolute;
                    margin: auto;
                }

                #release {
                    text-align: center;
                    width: 100%;
                    position: absolute;
                    top: 128px;
                    text-shadow: 2px 2px #000;
                    font-size: 1.2em;
                }

                bunny-countdown {
                    margin-top: 4px;
                    padding-left: 4px;
                    padding-right: 4px;
                }

                #video-container {
                    overflow: hidden;
                    height: 100vh;
                    background-color: #212121;
                    background-repeat: no-repeat;
                    background-attachment: fixed;
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0
                    }
                    100% {
                        opacity: 1
                    }
                }

                #gameplay-video {
                    animation: fadeIn ease 0.8s;
                }

                #content {
                    margin-top: 48px;
                }

                #scroll-tip {
                    margin: auto;
                    height: 42px;
                    width: 42px;
                }

                bunny-icon[icon="down"] {
                    animation: qp 1s ease-in infinite;
                    display: block;
                }

                .icon-down {
                    width: 42px;
                    height: 42px;
                }

                @keyframes qp {
                    0% {
                        padding-top: -6px;
                    }
                    50% {
                        padding-top: 16px;
                    }
                    100% {
                        padding-top: -6px;
                    }
                }

                @media (orientation: portrait) {
                    #header {
                        height: 100vh;
                    }

                    #header-start-container {
                        bottom: 64px;
                    }
                }

            </style>

            <div id="header">

                <div id="video-container">
                    <video muted loop autoplay src="images/background.mp4" id="gameplay-video"></video>
                </div>

                <div id="release">
                    <span class="">Releases in January, 2022</span>
                    <bunny-countdown to="2022-01-01 00:00"></bunny-countdown>
                </div>
                <div id="header-start-container">

                    <!--<a id="install-link" href="#" @click="X{this._install.bind(this)}">
                        install to desktop
                    </a>-->

                    <!-- todo: hide if pwa -->
                    <bunny-button style="margin-bottom: 6px;" @click="${this._install.bind(this)}">install
                    </bunny-button>
                    
                    <bunny-button primary @click="${this.start.bind(this)}">PLAY NOW</bunny-button>

                    <div id="scroll-tip">
                        <bunny-icon icon="down" @click="${() => window.scrollTo(0, innerHeight)}"></bunny-icon>
                    </div>
                </div>

            </div>

            <bunny-box class="container center-box" id="content">
                <bunny-pages class="page-content">
                    <div slot="tabs">
                        <bunny-tab active>News</bunny-tab>
                        <bunny-tab>Classes</bunny-tab>
                        <bunny-tab>Spells</bunny-tab>
                        <bunny-tab>Skills</bunny-tab>
                        <bunny-tab>Screenshots</bunny-tab>
                    </div>
                    <div slot="pages">
                        <page-game></page-game>
                        <page-news></page-news>
                        <page-patch></page-patch>
                    </div>
                </bunny-pages>
            </bunny-box>

            <div id="footer">
                <div id="social"></div>
            </div>
        `;
    }

    connectedCallback() {
        this.installed = !(window.pwa);
        this.page = 0;

        application.subscribe('installed', installed => {
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
                    application.view('page-login');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                window.pwa = null;
            });
    }
}

window.customElements.define(PageStart.is, PageStart);