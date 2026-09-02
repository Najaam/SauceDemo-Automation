class BasePage {
    constructor(page) {
        this.page = page;
    }

    async navigate(url) {
        await this.page.goto(url);
    }

    async getTitle() {
        return await this.page.title();
    }

    async getURL() {
        return this.page.url();
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('domcontentloaded');
    }

    async takeScreenshot(testInfo, stepName = 'screenshot') {
        const screenshot = await this.page.screenshot({ fullPage: true });
        if (testInfo) {
            await testInfo.attach(stepName, { body: screenshot, contentType: 'image/png' });
        }
        return screenshot;
    }

    async clickElement(locator) {
        await locator.click();
    }

    async fillText(locator, text) {
        await locator.fill(text);
    }

    async getElementText(locator) {
        return await locator.textContent();
    }

    async isElementVisible(locator) {
        return await locator.isVisible();
    }
}

export default BasePage;
