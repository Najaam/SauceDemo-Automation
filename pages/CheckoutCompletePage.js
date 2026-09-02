import BasePage from './BasePage.js';

class CheckoutCompletePage extends BasePage {
    constructor(page) {
        super(page);
        this.pageTitle = page.locator('[data-test="title"]');
        this.completeHeader = page.locator('[data-test="complete-header"]');
        this.completeText = page.locator('[data-test="complete-text"]');
        this.backHomeButton = page.locator('[data-test="back-to-products"]');
    }

    async getHeaderText() {
        return await this.getElementText(this.completeHeader);
    }

    async getMessageText() {
        return await this.getElementText(this.completeText);
    }

    async backHome() {
        await this.clickElement(this.backHomeButton);
    }
}

export default CheckoutCompletePage;
