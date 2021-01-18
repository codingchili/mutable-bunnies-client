import {Test} from './test.js';
import {CharacterPage} from './characters.js';

/**
 * Realm select POM.
 */
export class RealmsPage extends Test {

    async realms() {
        return await this.page.evaluate(async () => {
            return new Promise((resolve) => application.onRealmList(resolve));
        });
    }

    async selectById(id) {
        await this.page.evaluate(async (id) => {
            let view = appView.realmsView;
            let promise = new Promise(resolve => application.onCharacterList(resolve));
            application.onRealmList((realms) => {
                for (let realm of realms) {
                    if (realm.id === id) {
                        view.select(realm);
                    }
                }
            });
            return promise;
        }, id);
        return new CharacterPage(this.page);
    }
}