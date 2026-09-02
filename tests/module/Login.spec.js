import { test, expect } from '@playwright/test';
import { createRequire } from 'module';
import LoginPage from '../../pages/LoginPage.js';
import SidebarMenu from '../../pages/SidebarMenu.js';

const require = createRequire(import.meta.url);
const loginData = require('../../testdata/loginData.json');

test.describe('SauceDemo - Login Module', () => {

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

    for (const data of loginData.validUsers) {
        test(`Valid Login - ${data.username}`, async ({ page }, testInfo) => {
            const loginPage = new LoginPage(page);

            await test.step(`Login with valid credentials: ${data.username}`, async () => {
                await loginPage.login(data.username, data.password);
                await loginPage.takeScreenshot(testInfo, `Step - Login submitted: ${data.username}`);
            });

            await test.step('Verify user is redirected to inventory page with success title', async () => {
                await expect(loginPage.successTitle).toHaveText(data.ExpectedMsg);
                await expect(page).toHaveURL(/.*inventory\.html/);
                await loginPage.takeScreenshot(testInfo, `Step - Verified Inventory Loaded for ${data.username}`);
            });
        });
    }

    for (const data of loginData.InvalidUsers) {
        const scenarioLabel = data.username ? data.username : 'Empty Username';
        test(`Invalid Login - ${scenarioLabel}`, async ({ page }, testInfo) => {
            const loginPage = new LoginPage(page);

            await test.step(`Attempt login with username: "${data.username}"`, async () => {
                await loginPage.login(data.username, data.password);
                await loginPage.takeScreenshot(testInfo, `Step - Invalid credentials entered: ${scenarioLabel}`);
            });

            await test.step('Verify error message is displayed', async () => {
                await expect(loginPage.errorMessage).toHaveText(data.ExpectedMsg);
                await loginPage.takeScreenshot(testInfo, `Step - Verified Error Message for ${scenarioLabel}`);
            });
        });
    }

    test('User Logout Flow', async ({ page }, testInfo) => {
        const loginPage = new LoginPage(page);
        const sidebar = new SidebarMenu(page);

        await test.step('Login with standard_user', async () => {
            await loginPage.login('standard_user', 'secret_sauce');
            await expect(loginPage.successTitle).toHaveText('Products');
            await loginPage.takeScreenshot(testInfo, 'Step - Logged in successfully');
        });

        await test.step('Logout via sidebar menu', async () => {
            await sidebar.logout();
            await loginPage.takeScreenshot(testInfo, 'Step - Clicked Logout');
        });

        await test.step('Verify user is redirected back to login page', async () => {
            await expect(loginPage.loginButton).toBeVisible();
            await expect(page).toHaveURL('https://www.saucedemo.com/');
            await loginPage.takeScreenshot(testInfo, 'Step - Verified Return to Login Page');
        });
    });

});