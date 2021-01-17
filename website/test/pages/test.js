import puppeteer from "puppeteer";


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

    async appview() {
        return this.page.evaluate(() => {
            return document.querySelector("body > app-view").shadowRoot;
        });
    }

    async close() {
        //await this.page.browser().close();
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
        let browser = await puppeteer.launch({
            headless: false
        });
        return (await browser.pages())[0];
    }
}