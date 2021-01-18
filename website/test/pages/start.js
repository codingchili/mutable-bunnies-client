import {Test} from './test.js';
import {LoginPage} from './login.js';

/**
 * Start page POM.
 */
export class StartPage extends Test {

    async init() {
        await super.gotoWaitIdle('/');
        return this;
    }

    async toLogin() {
        await this.page.evaluate(async () => {
            document.querySelector('app-view')
                .shadowRoot.querySelector('page-start')
                .shadowRoot.querySelector('#start')
                .click();
        });
        return new LoginPage(this.page);
    }

    static async open() {
        return new StartPage(await Test.start()).init();
    }
}