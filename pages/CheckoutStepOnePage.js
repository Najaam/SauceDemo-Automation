import BasePage from './BasePage.js';

class CheckoutStepOnePage extends BasePage {
    constructor(page) {
        super(page);
        this.pageTitle = page.locator('[data-test="title"]');
        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.postalCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
        this.cancelButton = page.locator('[data-test="cancel"]');
        this.errorMessage = page.locator('[data-test="error"]');
        this.errorCloseBtn = page.locator('[data-test="error-button"]');
    }

    async fillInformation(firstName, lastName, postalCode) {
        if (firstName !== undefined && firstName !== '') {
            await this.fillText(this.firstNameInput, firstName);
        } else {
            await this.firstNameInput.clear();
        }

        if (lastName !== undefined && lastName !== '') {
            await this.fillText(this.lastNameInput, lastName);
        } else {
            await this.lastNameInput.clear();
        }

        if (postalCode !== undefined && postalCode !== '') {
            await this.fillText(this.postalCodeInput, postalCode);
        } else {
            await this.postalCodeInput.clear();
        }
    }

    async continueCheckout() {
        await this.clickElement(this.continueButton);
    }

    async cancelCheckout() {
        await this.clickElement(this.cancelButton);
    }

    async getErrorMessage() {
        return await this.getElementText(this.errorMessage);
    }
}

export default CheckoutStepOnePage;
