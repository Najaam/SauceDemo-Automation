import BasePage from './BasePage.js';

class CartPage extends BasePage {
    constructor(page) {
        super(page);
        this.pageTitle = page.locator('[data-test="title"]');
        this.cartItems = page.locator('.cart_item');
        this.itemNames = page.locator('[data-test="inventory-item-name"]');
        this.itemPrices = page.locator('[data-test="inventory-item-price"]');
        this.itemQuantities = page.locator('[data-test="item-quantity"]');
        this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    }

    async gotoURL() {
        await this.navigate('https://www.saucedemo.com/cart.html');
    }

    async getItemCount() {
        return await this.cartItems.count();
    }

    async getItemNames() {
        return await this.itemNames.allTextContents();
    }

    async getItemPrices() {
        const prices = await this.itemPrices.allTextContents();
        return prices.map(price => parseFloat(price.replace('$', '')));
    }

    async removeItemByName(productName) {
        const itemCard = this.page.locator('.cart_item', {
            has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName })
        });
        await this.clickElement(itemCard.locator('button', { hasText: /Remove/i }));
    }

    async continueShopping() {
        await this.clickElement(this.continueShoppingButton);
    }

    async proceedToCheckout() {
        await this.clickElement(this.checkoutButton);
    }

    async isItemInCart(productName) {
        const matchingItem = this.page.locator('.cart_item', {
            has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName })
        });
        return await this.isElementVisible(matchingItem);
    }
}

export default CartPage;
