import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '../component/styles.js';

import '/component/bunny-box.js';
import '/component/bunny-input.js';
import '/component/bunny-button.js';
import '/component/bunny-toast.js';
import '/component/bunny-icon.js';
import '/component/bunny-tooltip.js';

const QUICK_PLAY_KEY = 'quick.play';
const QUICK_PLAY_PASS_LEN = 12;
const QUICK_PLAY_USER_BASE_LEN = 6;
const QUICK_PLAY_USER_LEN_ADD = 2;

class PageLogin extends HTMLElement {

    static get is() {
        return 'page-login';
    }

    constructor() {
        super();
        application.subscribe('view', (view) => {
            if (view === PageLogin.is) {
                this.username?.focus();

                this.banner();

                Promise.all(Array.of(
                    import('../script/network.js'),
                    import('../script/service/authentication.js'),
                    import('./game-realms.js'),
                    import('./game-characters.js'),
                    import('./patch-download.js'),
                )).then(() => {
                    this.authentication = new Authentication();
                    let dev = application.development;

                    if (dev.autologin) {
                        this.username.value = dev.user;
                        this.password.value = dev.pwd;
                        this.submit({keyCode: 13})
                    }
                });
            }
        });
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.showlogin();
    }

    banner() {
        fetch('/data/banner.json')
            .then(response => response.json())
            .then(json => {
                this._banner = json.text;
                application.publish('banner', this._banner);
            });
    }

    get template() {
        return html`
            <style>
                :host {
                    display: block;
                    padding-top: 276px;
                    padding-bottom: 20px;
                }

                ${BunnyStyles.noselect}
                ${BunnyStyles.headings}
                ${BunnyStyles.icons}
                .title {
                    text-align: center;
                    padding-top: 16px;
                    opacity: 0.76;
                    margin-bottom: 24px;
                }

                .container {
                    margin: auto;
                    width: 525px;
                    min-width: 326px;
                    display: block;
                    position: relative;
                }

                #quick-play {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    animation: qp 1s ease-in infinite;
                }

                @keyframes qp {
                    0% {
                        right: 16px;
                    }
                    50% {
                        right: 8px;
                    }
                    100% {
                        right: 16px;
                    }
                }

                .icon-fastforward {
                    fill: #c89d01;
                }

                #register {
                    margin-top: 32px;
                    margin-bottom: 4px;
                }

                bunny-input {
                    margin-top: 12px;
                }

                h4 {
                    text-align: center;
                    color: white;
                    font-weight: 400;
                    font-size: 20px;
                }

                @media (max-width: 728px), (max-height: 768px) {
                    :host {
                        padding-top: 0;
                    }

                    .container {
                        width: 100%;
                        margin-top: 36px;
                    }
                }

                .margintop {
                    margin-top: 48px;
                }
            </style>

            <!-- keydown events? -->

            <bunny-box class="container">
                <div class="title">
                    <h4 class="noselect">${this.title}</h4>
                </div>

                ${this.islogin ? html`
                    <bunny-icon id="quick-play" icon="fastforward"
                                @mousedown="${() => this._quickPlay()}"></bunny-icon>
                    <bunny-tooltip location="left">
                        ${this._quickPlayEnabled() ? html`
                            <span style="white-space: pre-line;">Quick Play ${emojify('zap')} with account </span><span
                                    style="font-weight: 400">'${this._quickPlayEnabled().username}'</span>
                        ` : html`
                            <span style="white-space: pre-line;">Quick play creates a random username <br> and password and stores it in the browser.<br>
                            If the browser storage is cleared,<br>the password will be gone forever. &#x26A1;
                        </span>
                        `}
                    </bunny-tooltip>
                ` : ''}

                <bunny-input id="username" label="Username" @keydown="${this.submit.bind(this)}"></bunny-input>
                <bunny-input id="password" label="Password" type="password"
                             @keydown="${this.submit.bind(this)}"></bunny-input>

                <div class="register" ?hidden="${this.islogin}">
                    <bunny-input id="password-repeat" label="Password (repeat)" type="password"
                                 @keydown="${this.submit.bind(this)}"></bunny-input>
                    <bunny-input id="email" label="Email (optional)" @keydown="${this.submit.bind(this)}"></bunny-input>

                    <div class="buttons">
                        <bunny-button class="margintop flex" @click="${this.showlogin.bind(this)}">Back</bunny-button>
                        <bunny-button class="flex" id="register-commit" primary @click="${this.register.bind(this)}">
                            Register
                        </bunny-button>
                    </div>
                </div>

                <div class="buttons login" ?hidden="${!this.islogin}">
                    <bunny-button id="register" class="margintop flex" @click="${this.showregister.bind(this)}">
                        Register
                    </bunny-button>
                    <bunny-button id="login" class="flex" primary @click="${this.authenticate.bind(this)}">Login
                    </bunny-button>
                </div>
                <bunny-toast></bunny-toast>
            </bunny-box>
        `;
    }

    _quickPlayEnabled() {
        let user = localStorage.getItem(QUICK_PLAY_KEY);
        if (user) {
            return JSON.parse(user);
        } else {
            return false;
        }
    }

    _username() {
        let vowels = 'aeiou'.split('');
        let consonants = 'bcdfghjklmnpqrstwvz'.split('');

        return [...Array(Math.round(QUICK_PLAY_USER_BASE_LEN + Math.random() * QUICK_PLAY_USER_LEN_ADD)).keys()].map(index => {
            let next = (index % 2 === 0) ? consonants : vowels;
            return next[next.length * Math.random() | 0];
        }).join('');
    }

    _password() {
        let buffer = new Uint8Array(QUICK_PLAY_PASS_LEN);
        crypto.getRandomValues(buffer);
        return [...buffer].map(i => i.toString(16)).join('')
    }

    _quickPlaySetup() {
        let user = {
            username: this._username(),
            password: this._password()
        }
        return user;
    }

    _quickPlay() {
        let account = this._quickPlayEnabled();
        let input = (account) => {
            this.username.value = account.username;
            this.password.value = account.password;
            this.repeat.value = account.password;

            application.onAuthentication((login) => {
                // only save quickPlay account if authentication/registration succeeds.
                if (login.account === account.username) {
                    localStorage.setItem(QUICK_PLAY_KEY, JSON.stringify(account));
                }
            });
        }

        if (account) {
            input(account);
            this.authenticate();
        } else {
            input(this._quickPlaySetup());
            this.register();
        }
    }

    submit(e) {
        if (e.keyCode === 13) {
            if (this.islogin) {
                this.authenticate();
            } else {
                this.register();
            }
        }
    }

    showToast(text) {
        this.toast.open(text);
    }

    hideToast() {
        this.toast.close();
    }

    submit(e) {
        if (e.keyCode === 13) {
            if (!this.islogin)
                this.register();

            if (this.islogin)
                this.authenticate();
        }
    }

    authenticate() {
        this.showToast('Authenticating..');

        this.authentication.login({
            accepted: (data) => {
                this.resetForm();
                application.authenticated(data);
            },
            unauthorized: (data) => {
                this.showToast('Invalid user credentials');
                this.password.clear();
                this.password.focus();
            },
            missing: (data) => {
                this.showToast('The specified username does not exist');
                this.showregister();
                this.repeat.focus();
            },
            error: (e) => {
                this.showToast(e.message);
            },
            failed: () => {
                application.error('Failed to establish a connection to the authentication server.', true)
            }
        }, this.username.value, this.password.value);
    }

    register() {
        if (this.password.value === this.repeat.value) {
            this.showToast('Registering..');
            this.authentication.register({
                accepted: (data) => {
                    this.resetForm();
                    application.authenticated(data);
                },
                bad: (e) => {
                    this.showToast('Error: ' + e.message);
                },
                conflict: (data) => {
                    this.showToast('The username is not available.');
                    this.username.focus();
                },
                error: (e) => {
                    this.showToast(e.message);
                },
                failed: () => {
                    application.error("Failed to establish a connection to the authentication server.", true)
                }
            }, this.username.value, this.password.value, this.email.value);
        } else {
            this.showToast('Password (repeat) does not match the password.');
            this.repeat.focus();
        }
    }

    resetForm() {
        this.hideToast();
        this.repeat.clear();
        this.password.clear();
        this.email.clear();
        this.showlogin();
    }

    showlogin() {
        this.title = 'Login';
        this.islogin = true;
        this.render();
        this.username.focus();
    }

    showregister() {
        this.title = 'Register';
        this.islogin = false;
        this.render();
        this.username.focus();
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
        if (this.username == null) {
            this.username = this.query('#username');
            this.password = this.query('#password');
            this.repeat = this.query('#password-repeat');
            this.email = this.query('#email');
            this.toast = this.query('bunny-toast');
        }
    }
}

customElements.define(PageLogin.is, PageLogin);