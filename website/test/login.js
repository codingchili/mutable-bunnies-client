import {LoginPage} from './pages/login.js';
import assert from 'assert';

describe('LoginPage', () => {
    let page;

    beforeEach(async () => page = await LoginPage.open());

    /*it('should load without errors', async () => assert(!page.errors));

    it('should login as the admin user', async () => {
        await page.login('admin', 'admin');
    });*/

    it('should register as a new user', async () => {
        await page.register();
    });

    afterEach(async () => await page.close());
});
