import {LoginPage} from "./pages/login.js";
import assert from 'assert';
import {performance} from 'perf_hooks'

describe('GamePage', () => {
    let page;

    before(async () => {
        let start = performance.now();
        let loginPage = await LoginPage.open()
        let realmsPage = await loginPage.login('admin', 'admin')
        let characterPage = await realmsPage.selectById('angel_oak');
        page = await characterPage.selectById('test');
        console.log((performance.now() - start) + 'ms.');
    });

    it('have game instance loaded and playing', async () => {
        assert(await page.inGame());
    });

    after(async () => await page.close());
});
