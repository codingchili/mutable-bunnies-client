import {LoginPage} from './pages/login.js';
import {RealmsPage} from './pages/realms.js';
import assert from 'assert';

describe('RealmsPage', () => {
    let page;

    before(async () => {
        page = await LoginPage.open()
        page = await page.login('admin', 'admin')
    });

    it('should list the angel_oak realm', async () => {
        let realms = await page.realms();
        assert.strictEqual('angel_oak', realms[0].id);
    });

    it('should connect to realm given id', async () => {
        await page.selectById('angel_oak');
    });

    after(async () => await page.close());
});
