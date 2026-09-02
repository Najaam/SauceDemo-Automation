import BasePage from './BasePage.js';

class ProductDetailsPage extends BasePage {
    constructor(page) {
        super(page);
        this.productName = page.locator('[data-test="inventory-item-name"]');
        this.productDescription = page.locator('[data-test="inventory-item-desc"]');
        this.productPrice = page.locator('[data-test="inventory-item-price"]');
        this.addToCartButton = page.locator('[data-test="add-to-cart"]');
        this.removeButton = page.locator('[data-test="remove"]');
        this.backToProductsButton = page.locator('[data-test="back-to-products"]');
        this.cartLink = page.locator('[data-test="shopping-cart-link"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    }

    async getProductName() {
        return await this.getElementText(this.productName);
    }

    async getProductDescription() {
        return await this.getElementText(this.productDescription);
    }

    async getProductPrice() {
        const priceText = await this.getElementText(this.productPrice);
        return parseFloat(priceText?.replace('$', '') || '0');
    }

    async addToCart() {
        await this.clickElement(this.addToCartButton);
    }

    async removeFromCart() {
        await this.clickElement(this.removeButton);
    }

    async backToProducts() {
        await this.clickElement(this.backToProductsButton);
    }

    async getCartBadgeCount() {
        if (await this.isElementVisible(this.cartBadge)) {
            const countText = await this.getElementText(this.cartBadge);
            return parseInt(countText || '0', 10);
        }
        return 0;
    }

    async goToCart() {
        await this.clickElement(this.cartLink);
    }
}

export default ProductDetailsPage;
