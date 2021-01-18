import {LoginPage} from './pages/login.js';
import assert from 'assert';

describe('CharacterPage', () => {
    let page;

    before(async () => {
        let loginPage = await LoginPage.open()
        let realmsPage = await loginPage.login('admin', 'admin')
        page = await realmsPage.selectById('angel_oak');
    });

    it('should retrieve at least one character', async () => {
        let characters = await page.characters();
        assert(characters.length > 0, 'need to find at least one character.');
    });

    it('should connect to game server with character', async () => {
        await page.selectById('test');
    });

    it('should allow creation of specified player classes', async () => {
        await page.enabled(['druid', 'slayer', 'necromancer', 'assassin', 'hunter', 'paladin']);
    });

    /*it('should create a new character', async () => {
        await page.create('foo', 'druid');
    });*/

    after(async () => await page.close());
});
