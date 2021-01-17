import {StartPage} from './pages/start.js';
import assert from "assert";

describe('StartPage', () => {
    let page;

    before(async () => page = await StartPage.open());

    it('should load without errors', async () => assert(!page.errors));

    it('should navigate to login page', async () => {
        await page.toLogin();
    });

    after(async () => await page.close());
});
