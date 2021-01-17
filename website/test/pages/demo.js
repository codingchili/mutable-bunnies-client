import {Test} from './test.js';

/**
 * Demo page for all components.
 */
export class DemoPage extends Test {
    async init() {
        await super.gotoWaitIdle('/component/demo.html');
        return this;
    }

    static async open() {
        return new DemoPage(await Test.start()).init();
    }
}