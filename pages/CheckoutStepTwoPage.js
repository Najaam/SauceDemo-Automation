import BasePage from './BasePage.js';

class CheckoutStepTwoPage extends BasePage {
    constructor(page) {
        super(page);
        this.pageTitle = page.locator('[data-test="title"]');
        this.cartItems = page.locator('.cart_item');
        this.itemNames = page.locator('[data-test="inventory-item-name"]');
        this.itemPrices = page.locator('[data-test="inventory-item-price"]');
        this.paymentInfoValue = page.locator('[data-test="payment-info-value"]');
        this.shippingInfoValue = page.locator('[data-test="shipping-info-value"]');
        this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
        this.taxLabel = page.locator('[data-test="tax-label"]');
        this.totalLabel = page.locator('[data-test="total-label"]');
        this.finishButton = page.locator('[data-test="finish"]');
        this.cancelButton = page.locator('[data-test="cancel"]');
    }

    async getItemNames() {
        return await this.itemNames.allTextContents();
    }

    async getPaymentInfo() {
        return await this.getElementText(this.paymentInfoValue);
    }

    async getShippingInfo() {
        return await this.getElementText(this.shippingInfoValue);
    }

    async getSubtotal() {
        const text = await this.getElementText(this.subtotalLabel);
        const match = text?.match(/\$([0-9.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    async getTax() {
        const text = await this.getElementText(this.taxLabel);
        const match = text?.match(/\$([0-9.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    async getTotal() {
        const text = await this.getElementText(this.totalLabel);
        const match = text?.match(/\$([0-9.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    async finishCheckout() {
        await this.clickElement(this.finishButton);
    }

    async cancelCheckout() {
        await this.clickElement(this.cancelButton);
    }
}

export default CheckoutStepTwoPage;
