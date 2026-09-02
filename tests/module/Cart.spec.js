import { test, expect } from '@playwright/test';
import { createRequire } from 'module';
import LoginPage from '../../pages/LoginPage.js';
import InventoryPage from '../../pages/InventoryPage.js';
import CartPage from '../../pages/CartPage.js';

const require = createRequire(import.meta.url);
const productsData = require('../../testdata/productsData.json');

test.describe('SauceDemo - Shopping Cart Module', () => {

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

    test('Verify items added appear in cart with correct name and price', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        const item1 = productsData.products[0];
        const item2 = productsData.products[1];

        await test.step('Add two items from inventory page', async () => {
            await inventoryPage.addProductToCart(item1.name);
            await inventoryPage.addProductToCart(item2.name);
            expect(await inventoryPage.getCartBadgeCount()).toBe(2);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Added 2 Items in Inventory');
        });

        await test.step('Navigate to Cart page', async () => {
            await inventoryPage.goToCart();
            await expect(cartPage.pageTitle).toHaveText('Your Cart');
            await expect(page).toHaveURL(/.*cart\.html/);
            await cartPage.takeScreenshot(testInfo, 'Step - Opened Cart Page');
        });

        await test.step('Verify cart items count, names, and prices', async () => {
            expect(await cartPage.getItemCount()).toBe(2);

            const names = await cartPage.getItemNames();
            expect(names).toContain(item1.name);
            expect(names).toContain(item2.name);

            const prices = await cartPage.getItemPrices();
            expect(prices).toContain(item1.price);
            expect(prices).toContain(item2.price);

            await cartPage.takeScreenshot(testInfo, 'Step - Verified Cart Items and Prices');
        });
    });

    test('Verify removing an item directly from Cart page', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        const item1 = productsData.products[0].name;
        const item2 = productsData.products[1].name;

        await test.step('Add two items and navigate to cart', async () => {
            await inventoryPage.addProductToCart(item1);
            await inventoryPage.addProductToCart(item2);
            await inventoryPage.goToCart();
            expect(await cartPage.getItemCount()).toBe(2);
            await cartPage.takeScreenshot(testInfo, 'Step - Cart Initial Items');
        });

        await test.step(`Remove item "${item1}" from cart`, async () => {
            await cartPage.removeItemByName(item1);
            await cartPage.takeScreenshot(testInfo, `Step - Removed ${item1}`);
        });

        await test.step('Verify cart list updates to 1 item', async () => {
            expect(await cartPage.getItemCount()).toBe(1);
            expect(await cartPage.isItemInCart(item1)).toBe(false);
            expect(await cartPage.isItemInCart(item2)).toBe(true);
            await cartPage.takeScreenshot(testInfo, 'Step - Verified Remaining Cart Items');
        });
    });

    test('Verify Continue Shopping navigation back to inventory', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        await test.step('Navigate to Cart page', async () => {
            await inventoryPage.goToCart();
            await expect(cartPage.pageTitle).toHaveText('Your Cart');
            await cartPage.takeScreenshot(testInfo, 'Step - On Cart Page');
        });

        await test.step('Click Continue Shopping', async () => {
            await cartPage.continueShopping();
            await expect(inventoryPage.pageTitle).toHaveText('Products');
            await expect(page).toHaveURL(/.*inventory\.html/);
            await inventoryPage.takeScreenshot(testInfo, 'Step - Returned to Inventory via Continue Shopping');
        });
    });

    test('Verify Checkout button navigates to Checkout Step One', async ({ page }, testInfo) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        await test.step('Add product and go to cart', async () => {
            await inventoryPage.addProductToCart(productsData.products[0].name);
            await inventoryPage.goToCart();
            await cartPage.takeScreenshot(testInfo, 'Step - On Cart Page with Item');
        });

        await test.step('Click Checkout button', async () => {
            await cartPage.proceedToCheckout();
            await expect(page).toHaveURL(/.*checkout-step-one\.html/);
            await cartPage.takeScreenshot(testInfo, 'Step - Navigated to Checkout Step One');
        });
    });

});
