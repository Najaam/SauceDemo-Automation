import { test, expect } from '@playwright/test';
import { createRequire } from 'module';
import LoginPage from '../../pages/LoginPage.js';
import InventoryPage from '../../pages/InventoryPage.js';
import CartPage from '../../pages/CartPage.js';
import CheckoutStepOnePage from '../../pages/CheckoutStepOnePage.js';
import CheckoutStepTwoPage from '../../pages/CheckoutStepTwoPage.js';
import CheckoutCompletePage from '../../pages/CheckoutCompletePage.js';
import SidebarMenu from '../../pages/SidebarMenu.js';

const require = createRequire(import.meta.url);
const checkoutData = require('../../testdata/checkoutData.json');

test.describe('SauceDemo - End-to-End Purchase Flow', () => {

    test.beforeAll(async () => {
    });

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.gotoURL();
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

    test('Complete E2E Journey: Login -> Sort -> Add Products -> Cart -> Checkout -> Overview -> Finish -> Logout', async ({ page }, testInfo) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const stepOne = new CheckoutStepOnePage(page);
        const stepTwo = new CheckoutStepTwoPage(page);
        const completePage = new CheckoutCompletePage(page);
        const sidebar = new SidebarMenu(page);

        const item1 = 'Sauce Labs Onesie';
        const item2 = 'Sauce Labs Fleece Jacket';
        const customer = checkoutData.validCustomer;

        await test.step('Step 1: Open website and Login with valid credentials', async () => {
            await loginPage.login('standard_user', 'secret_sauce');
            await expect(loginPage.successTitle).toHaveText('Products');
            await loginPage.takeScreenshot(testInfo, 'Step 1 - Login Success');
        });

        await test.step('Step 2: Filter inventory items by Price (low to high)', async () => {
            await inventoryPage.sortBy('lohi');
            const prices = await inventoryPage.getAllItemPrices();
            const sortedPrices = [...prices].sort((a, b) => a - b);
            expect(prices).toEqual(sortedPrices);
            await inventoryPage.takeScreenshot(testInfo, 'Step 2 - Sorted Inventory');
        });

        await test.step('Step 3: Add multiple items to the cart', async () => {
            await inventoryPage.addProductToCart(item1);
            await inventoryPage.addProductToCart(item2);
            expect(await inventoryPage.getCartBadgeCount()).toBe(2);
            await inventoryPage.takeScreenshot(testInfo, 'Step 3 - Added Items to Cart');
        });

        await test.step('Step 4: Navigate to Shopping Cart and verify added items', async () => {
            await inventoryPage.goToCart();
            await expect(cartPage.pageTitle).toHaveText('Your Cart');
            expect(await cartPage.getItemCount()).toBe(2);
            expect(await cartPage.isItemInCart(item1)).toBe(true);
            expect(await cartPage.isItemInCart(item2)).toBe(true);
            await cartPage.takeScreenshot(testInfo, 'Step 4 - Cart Verification');
        });

        await test.step('Step 5: Proceed to Checkout Step One and fill customer information', async () => {
            await cartPage.proceedToCheckout();
            await expect(stepOne.pageTitle).toHaveText('Checkout: Your Information');
            await stepOne.fillInformation(customer.firstName, customer.lastName, customer.postalCode);
            await stepOne.takeScreenshot(testInfo, 'Step 5a - Filled Shipping Info');
            await stepOne.continueCheckout();
        });

        await test.step('Step 6: Verify Checkout Step Two Overview details and calculated total', async () => {
            await expect(stepTwo.pageTitle).toHaveText('Checkout: Overview');
            const itemNames = await stepTwo.getItemNames();
            expect(itemNames).toContain(item1);
            expect(itemNames).toContain(item2);

            const subtotal = await stepTwo.getSubtotal();
            const tax = await stepTwo.getTax();
            const total = await stepTwo.getTotal();

            expect(parseFloat((subtotal + tax).toFixed(2))).toBe(total);
            await stepTwo.takeScreenshot(testInfo, 'Step 6 - Order Overview and Totals');
        });

        await test.step('Step 7: Finish checkout and verify order confirmation', async () => {
            await stepTwo.finishCheckout();
            await expect(completePage.pageTitle).toHaveText('Checkout: Complete!');
            expect(await completePage.getHeaderText()).toBe(checkoutData.orderCompletion.expectedHeader);
            expect(await completePage.getMessageText()).toBe(checkoutData.orderCompletion.expectedMessage);
            await completePage.takeScreenshot(testInfo, 'Step 7 - Order Confirmation');
        });

        await test.step('Step 8: Return to Products catalog and Logout via Sidebar', async () => {
            await completePage.backHome();
            await expect(inventoryPage.pageTitle).toHaveText('Products');
            await completePage.takeScreenshot(testInfo, 'Step 8a - Back to Home');

            await sidebar.logout();
            await expect(loginPage.loginButton).toBeVisible();
            await expect(page).toHaveURL('https://www.saucedemo.com/');
            await loginPage.takeScreenshot(testInfo, 'Step 8b - User Logged Out');
        });
    });

});
