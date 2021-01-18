import puppeteer from "puppeteer";

/**
 * Shared test code for pages.
 */
export class Test {

    constructor(page) {
        this._page = page;
        this._errors = [];
        this.page.on("error", (e) => this._errors.push(e));
        this.page.on("pageerror", (e) => this._errors.push(e));
    }

    get errors() {
        return this._errors.length > 0;
    }

    get page() {
        return this._page;
    }

    async close() {
        await this.page.browser().close();
    }

    async gotoWaitIdle(uri) {
        return await Test.gotoWaitIdle(this.page, uri);
    }

    async screenshot(fileName = "screenshot") {
        return await this.page.screenshot({path: `${fileName}.png`});
    }

    static url(uri) {
        return `http://127.0.0.1:8080${uri}`;
    }

    static async gotoWaitIdle(page, uri) {
        await page.goto(Test.url(uri), {waitUntil: 'networkidle0'});
        return page;
    }

    static async start() {
        let headless = true;
        let browser;

        if (headless) {
            // hack default args to enable webgl when running headless.
            // https://github.com/puppeteer/puppeteer/issues/3637
            const args = puppeteer.defaultArgs().filter(arg => arg !== '--disable-gpu');
            args.push('--use-gl=desktop');
            args.push('--headless');
            browser = await puppeteer.launch({
                ignoreDefaultArgs: true,
                args
            });
        } else {
            browser = await puppeteer.launch({
                headless: false,
                slowMo: 0,
            });
        }
        return (await browser.pages())[0];
    }
}