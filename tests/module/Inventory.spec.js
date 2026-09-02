import { test, expect } from '@playwright/test';
import { createRequire } from 'module';
import LoginPage from '../../pages/LoginPage.js';
import InventoryPage from '../../pages/InventoryPage.js';
import ProductDetailsPage from '../../pages/ProductDetailsPage.js';

const require = createRequire(import.meta.url);
const productsData = require('../../testdata/productsData.json');

test.describe('SauceDemo - Inventory Module', () => {

    test.beforeAll(async () => {
    });

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.gotoURL();
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(loginPage.successTitle).toHaveText('Products');
    });

    test.afterEach(async ({ page }, testInfo) => {
        const sanitizedTitle = testInfo.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const screenshot = await page.screenshot({
            path: `test-results/screenshots/${sanitizedTitle}.png`,
            fullPage: true
        });
        await testInfo.attach('final-screenshot', {
            body: screenshot,
            contentType: 'image/png'
        });
    });

    test.afterAll(async () => {
    });

    test('Verify all 6 products are displayed with correct details', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);

        await test.step('Verify total product count', async () => {
            const count = await inventoryPage.getItemCount();
            expect(count).toBe(productsData.totalCount);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Verified Total Product Count');
        });

        await test.step('Verify all expected product names are present', async () => {
            const names = await inventoryPage.getAllItemNames();
            for (const expectedProduct of productsData.products) {
                expect(names).toContain(expectedProduct.name);
            }
            await inventoryPage.takeScreenshot(testInfo, 'Step - Verified Product Names');
        });
    });

    test('Verify sorting products by Name: A-Z and Z-A', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);

        await test.step('Sort A to Z (Default)', async () => {
            await inventoryPage.sortBy(productsData.sortOptions.az);
            const names = await inventoryPage.getAllItemNames();
            const sortedNames = [...names].sort();
            expect(names).toEqual(sortedNames);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Sorted A to Z');
        });

        await test.step('Sort Z to A', async () => {
            await inventoryPage.sortBy(productsData.sortOptions.za);
            const names = await inventoryPage.getAllItemNames();
            const sortedNames = [...names].sort().reverse();
            expect(names).toEqual(sortedNames);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Sorted Z to A');
        });
    });

    test('Verify sorting products by Price: Low to High and High to Low', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);

        await test.step('Sort Price (low to high)', async () => {
            await inventoryPage.sortBy(productsData.sortOptions.lohi);
            const prices = await inventoryPage.getAllItemPrices();
            const sortedPrices = [...prices].sort((a, b) => a - b);
            expect(prices).toEqual(sortedPrices);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Sorted Price Low to High');
        });

        await test.step('Sort Price (high to low)', async () => {
            await inventoryPage.sortBy(productsData.sortOptions.hilo);
            const prices = await inventoryPage.getAllItemPrices();
            const sortedPrices = [...prices].sort((a, b) => b - a);
            expect(prices).toEqual(sortedPrices);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Sorted Price High to Low');
        });
    });

    test('Verify Add to Cart and Remove functionality updates cart badge', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);
        const item1 = 'Sauce Labs Backpack';
        const item2 = 'Sauce Labs Bike Light';

        await test.step('Initially cart badge should be 0', async () => {
            expect(await inventoryPage.getCartBadgeCount()).toBe(0);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Initial Cart Empty');
        });

        await test.step('Add first item to cart', async () => {
            await inventoryPage.addProductToCart(item1);
            expect(await inventoryPage.getCartBadgeCount()).toBe(1);
            await inventoryPage.takeScreenshot(testInfo, `Step - Added ${item1}`);
        });

        await test.step('Add second item to cart', async () => {
            await inventoryPage.addProductToCart(item2);
            expect(await inventoryPage.getCartBadgeCount()).toBe(2);
            await inventoryPage.takeScreenshot(testInfo, `Step - Added ${item2}`);
        });

        await test.step('Remove first item from cart', async () => {
            await inventoryPage.removeProductFromCart(item1);
            expect(await inventoryPage.getCartBadgeCount()).toBe(1);
            await inventoryPage.takeScreenshot(testInfo, `Step - Removed ${item1}`);
        });
    });

    test('Verify product details navigation and back navigation', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);
        const productDetailsPage = new ProductDetailsPage(page);
        const targetProduct = productsData.products[0];

        await test.step(`Click on product: ${targetProduct.name}`, async () => {
            await inventoryPage.clickProductTitle(targetProduct.name);
            await expect(page).toHaveURL(/.*inventory-item\.html.*/);
            await productDetailsPage.takeScreenshot(testInfo, `Step - Navigated to ${targetProduct.name} Details`);
        });

        await test.step('Verify product details on details page', async () => {
            expect(await productDetailsPage.getProductName()).toBe(targetProduct.name);
            expect(await productDetailsPage.getProductPrice()).toBe(targetProduct.price);
            await productDetailsPage.takeScreenshot(testInfo, 'Step - Verified Product Details');
        });

        await test.step('Add to cart from product details page', async () => {
            await productDetailsPage.addToCart();
            expect(await productDetailsPage.getCartBadgeCount()).toBe(1);
            await productDetailsPage.takeScreenshot(testInfo, 'Step - Added from Details Page');
        });

        await test.step('Click Back to products button', async () => {
            await productDetailsPage.backToProducts();
            await expect(inventoryPage.pageTitle).toHaveText('Products');
            expect(await inventoryPage.getCartBadgeCount()).toBe(1);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Returned Back to Products Catalog');
        });
    });

});
