import {Test} from './test.js';
import {StartPage} from './start.js';
import crypto from 'crypto';

/**
 * Demo page for all components.
 */
export class LoginPage extends Test {

    async init() {
        let start = await new StartPage(this.page).init();
        await start.toLogin();
        return this;
    }

    async login(username, password) {
        return this.page.evaluate(() => {
            let view = document.querySelector("app-view")
                .shadowRoot.querySelector("page-login")
                .shadowRoot;

            let username = view.querySelector("#username");
            let password = view.querySelector('#password');
            let submit = view.querySelector('#login');

            username.value = 'admin';
            password.value = 'admin';
            submit.click();
        });
    }

    async register(username, password, email) {
        username = username || crypto.randomBytes(24).toString('hex');
        password = password || crypto.randomBytes(24).toString('hex');

        return this.page.evaluate((username, password, email) => {
            let view = document.querySelector("app-view").shadowRoot
                .querySelector("page-login").shadowRoot;

            view.querySelector('#register').click();
            view.querySelector("#username").value = username;
            view.querySelector("#password").value = password;
            view.querySelector('#password-repeat').value = password;
            view.querySelector('#email').value = email;
            view.querySelector('#register-commit').click();
        }, username, password, email);
    }

    static async open() {
        return await new LoginPage(await Test.start()).init();
    }
}