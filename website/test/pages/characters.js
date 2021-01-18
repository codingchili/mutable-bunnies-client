import {Test} from './test.js';
import {GamePage} from './game.js';

/**
 * Character select POM.
 */
export class CharacterPage extends Test {

    async characters() {
        return this.page.evaluate(() => appView.characterView.characters());
    }

    async enabled(list) {
        return await this.page.evaluate((list) => {
            let classes = application.realm.availableClasses;
            let difference = classes
                .filter(x => !list.includes(x))
                .concat(list.filter(x => !classes.includes(x)));

            if (difference.length > 0) {
                throw Error(`Mismatch; available classes ${classes}, expected: ${list}`);
            }
        }, list);
    }

    async create(name, classId) {
        await this.page.evaluate((classId) => {
            let view = appView.characterView;
            view.showCreate();
            application.realm.classes
                .filter(pc => pc.id === classId)
                .forEach(pc => {
                    view.creator.select(pc);
                });
        }, classId);
    }

    async selectById(id) {
        await this.page.evaluate(async (id) => {
            let view = appView.characterView;
            let promise = new Promise(resolve => application.onGameLoaded(resolve));
            for (let character of view.characters()) {
                if (character.id === id) {
                    view.select(character);
                }
            }
            return promise;
        }, id);
        return new GamePage(this.page);
    }
}