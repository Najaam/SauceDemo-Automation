import BasePage from './BasePage.js';
import SidebarMenu from './SidebarMenu.js';

class InventoryPage extends BasePage {
    constructor(page) {
        super(page);
        this.sidebar = new SidebarMenu(page);

        this.pageTitle = page.locator('[data-test="title"]');
        this.sortDropdown = page.locator('[data-test="product-sort-container"]');
        this.inventoryItems = page.locator('[data-test="inventory-item"]');
        this.itemNames = page.locator('[data-test="inventory-item-name"]');
        this.itemDescriptions = page.locator('[data-test="inventory-item-desc"]');
        this.itemPrices = page.locator('[data-test="inventory-item-price"]');
        this.cartLink = page.locator('[data-test="shopping-cart-link"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    }

    async gotoURL() {
        await this.navigate('https://www.saucedemo.com/inventory.html');
    }

    async getItemCount() {
        return await this.inventoryItems.count();
    }

    async getAllItemNames() {
        return await this.itemNames.allTextContents();
    }

    async getAllItemPrices() {
        const prices = await this.itemPrices.allTextContents();
        return prices.map(price => parseFloat(price.replace('$', '')));
    }

    async sortBy(option) {
        await this.sortDropdown.selectOption(option);
    }

    async addProductToCart(productName) {
        const productCard = this.page.locator('[data-test="inventory-item"]', {
            has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName })
        });
        await this.clickElement(productCard.locator('button', { hasText: /Add to cart/i }));
    }

    async removeProductFromCart(productName) {
        const productCard = this.page.locator('[data-test="inventory-item"]', {
            has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName })
        });
        await this.clickElement(productCard.locator('button', { hasText: /Remove/i }));
    }

    async clickProductTitle(productName) {
        await this.clickElement(this.page.locator('[data-test="inventory-item-name"]', { hasText: productName }));
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

export default InventoryPage;
