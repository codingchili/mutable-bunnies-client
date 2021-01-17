import {DemoPage} from "./pages/demo.js";
import assert from 'assert';

describe('DemoPage', () => {
    let page;

    before(async () => page = await DemoPage.open());

    it('should load without errors', async () => assert(!page.errors));

    after(async () => await page.close());
});
