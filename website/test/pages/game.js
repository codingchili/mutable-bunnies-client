import {Test} from './test.js';

/**
 * Game interface.
 */
export class GamePage extends Test {

    async inGame() {
        return await this.page.evaluate(() => {
            return game.loaded && game.isPlaying;
        });
    }
}