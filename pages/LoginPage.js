import BasePage from './BasePage.js';

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.successTitle = page.locator('[data-test="title"]');
        this.sucessTitle = this.successTitle;
        this.errorMessage = page.locator('[data-test="error"]');
        this.errorMsg = this.errorMessage;
        this.errorCloseBtn = page.locator('[data-test="error-button"]');
    }

    async gotoURL() {
        await this.navigate('https://www.saucedemo.com/');
    }

    async login(username, password) {
        if (username !== undefined && username !== '') {
            await this.fillText(this.usernameInput, username);
        } else {
            await this.usernameInput.clear();
        }

        if (password !== undefined && password !== '') {
            await this.fillText(this.passwordInput, password);
        } else {
            await this.passwordInput.clear();
        }

        await this.clickElement(this.loginButton);
    }

    async getErrorMessage() {
        return await this.getElementText(this.errorMessage);
    }
}

export default LoginPage;