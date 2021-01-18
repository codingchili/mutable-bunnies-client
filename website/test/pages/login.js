import {Test} from './test.js';
import {StartPage} from './start.js';
import {RealmsPage} from './realms.js';
import crypto from 'crypto';

/**
 * Login page POM.
 */
export class LoginPage extends Test {

    async init() {
        let start = await new StartPage(this.page).init();
        await start.toLogin();
        return this;
    }

    async login(username, password) {
        await this.page.evaluate(async (username, password) => {
            application.development.logEvents = true;
            let view = appView.loginView.shadowRoot;
            view.querySelector("#username").value = username;
            view.querySelector('#password').value = password;
            view.querySelector('#login').click();
            return new Promise(resolve => application.onRealmList(resolve));
        }, username, password);
        return new RealmsPage(this.page);
    }

    async register(username, password, email) {
        username = username || crypto.randomBytes(24).toString('hex');
        password = password || crypto.randomBytes(24).toString('hex');

        await this.page.evaluate(async (username, password, email) => {
            let view = appView.loginView.shadowRoot;
            view.querySelector('#register').click();
            view.querySelector("#username").value = username;
            view.querySelector("#password").value = password;
            view.querySelector('#password-repeat').value = password;
            view.querySelector('#email').value = email;
            view.querySelector('#register-commit').click();
            return new Promise(resolve => application.onAuthentication(resolve));
        }, username, password, email);
        return new RealmsPage(this.page);
    }

    static async open() {
        return await new LoginPage(await Test.start()).init();
    }
}