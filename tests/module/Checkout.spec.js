import { test, expect } from '@playwright/test';
import { createRequire } from 'module';
import LoginPage from '../../pages/LoginPage.js';
import InventoryPage from '../../pages/InventoryPage.js';
import CartPage from '../../pages/CartPage.js';
import CheckoutStepOnePage from '../../pages/CheckoutStepOnePage.js';
import CheckoutStepTwoPage from '../../pages/CheckoutStepTwoPage.js';
import CheckoutCompletePage from '../../pages/CheckoutCompletePage.js';

const require = createRequire(import.meta.url);
const productsData = require('../../testdata/productsData.json');
const checkoutData = require('../../testdata/checkoutData.json');

test.describe('SauceDemo - Checkout Module', () => {

    test.beforeAll(async () => {
    });

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        await loginPage.gotoURL();
        await loginPage.login('standard_user', 'secret_sauce');
        await inventoryPage.addProductToCart(productsData.products[0].name);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
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

    for (const scenario of checkoutData.invalidCheckoutScenarios) {
        test(`Checkout Step One Validation - ${scenario.testTitle}`, async ({ page }, testInfo) => {
            const stepOne = new CheckoutStepOnePage(page);

            await test.step(`Fill form with: firstName="${scenario.firstName}", lastName="${scenario.lastName}", postalCode="${scenario.postalCode}"`, async () => {
                await stepOne.fillInformation(scenario.firstName, scenario.lastName, scenario.postalCode);
                await stepOne.takeScreenshot(testInfo, `Step - Filled Form: ${scenario.testTitle}`);
            });

            await test.step('Click Continue', async () => {
                await stepOne.continueCheckout();
            });

            await test.step('Verify validation error message', async () => {
                await expect(stepOne.errorMessage).toHaveText(scenario.expectedError);
                await stepOne.takeScreenshot(testInfo, `Step - Verified Error Message: ${scenario.testTitle}`);
            });
        });
    }

    test('Verify Cancel button on Checkout Step One returns to Cart', async ({ page }, testInfo) => {
        const stepOne = new CheckoutStepOnePage(page);
        const cartPage = new CartPage(page);

        await test.step('Click Cancel button on Step One', async () => {
            await stepOne.takeScreenshot(testInfo, 'Step - On Step One before Cancel');
            await stepOne.cancelCheckout();
        });

        await test.step('Verify returned to Cart page', async () => {
            await expect(cartPage.pageTitle).toHaveText('Your Cart');
            await expect(page).toHaveURL(/.*cart\.html/);
            await cartPage.takeScreenshot(testInfo, 'Step - Returned to Cart after Step One Cancel');
        });
    });

    test('Verify Checkout Step Two totals and complete order', async ({ page }, testInfo) => {
        const stepOne = new CheckoutStepOnePage(page);
        const stepTwo = new CheckoutStepTwoPage(page);
        const completePage = new CheckoutCompletePage(page);
        const customer = checkoutData.validCustomer;

        await test.step('Fill valid information in Step One and continue', async () => {
            await stepOne.fillInformation(customer.firstName, customer.lastName, customer.postalCode);
            await stepOne.takeScreenshot(testInfo, 'Step - Filled Valid Customer Info');
            await stepOne.continueCheckout();
            await expect(stepTwo.pageTitle).toHaveText('Checkout: Overview');
            await stepTwo.takeScreenshot(testInfo, 'Step - On Checkout Overview');
        });

        await test.step('Verify item and calculation (Subtotal + Tax = Total)', async () => {
            const itemNames = await stepTwo.getItemNames();
            expect(itemNames).toContain(productsData.products[0].name);

            const subtotal = await stepTwo.getSubtotal();
            const tax = await stepTwo.getTax();
            const total = await stepTwo.getTotal();

            expect(subtotal).toBe(productsData.products[0].price);
            expect(parseFloat((subtotal + tax).toFixed(2))).toBe(total);
            await stepTwo.takeScreenshot(testInfo, 'Step - Verified Calculation');
        });

        await test.step('Finish order and verify confirmation message', async () => {
            await stepTwo.finishCheckout();
            await expect(completePage.pageTitle).toHaveText('Checkout: Complete!');
            expect(await completePage.getHeaderText()).toBe(checkoutData.orderCompletion.expectedHeader);
            expect(await completePage.getMessageText()).toBe(checkoutData.orderCompletion.expectedMessage);
            await completePage.takeScreenshot(testInfo, 'Step - Order Completed Confirmation');
        });

        await test.step('Click Back Home button', async () => {
            await completePage.backHome();
            await expect(page).toHaveURL(/.*inventory\.html/);
            await completePage.takeScreenshot(testInfo, 'Step - Returned to Inventory Home');
        });
    });

    test('Verify Cancel button on Checkout Step Two returns to Inventory', async ({ page }, testInfo) => {
        const stepOne = new CheckoutStepOnePage(page);
        const stepTwo = new CheckoutStepTwoPage(page);
        const customer = checkoutData.validCustomer;

        await test.step('Proceed to Step Two', async () => {
            await stepOne.fillInformation(customer.firstName, customer.lastName, customer.postalCode);
            await stepOne.continueCheckout();
            await stepTwo.takeScreenshot(testInfo, 'Step - On Step Two');
        });

        await test.step('Click Cancel on Step Two', async () => {
            await stepTwo.cancelCheckout();
            await expect(page).toHaveURL(/.*inventory\.html/);
            await stepTwo.takeScreenshot(testInfo, 'Step - Returned to Inventory after Step Two Cancel');
        });
    });

});
