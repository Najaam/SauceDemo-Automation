import BasePage from './BasePage.js';

class SidebarMenu extends BasePage {
    constructor(page) {
        super(page);
        this.menuButton = page.locator('#react-burger-menu-btn');
        this.closeButton = page.locator('#react-burger-cross-btn');
        this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
        this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
        this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
        this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    }

    async open() {
        await this.clickElement(this.menuButton);
        await this.logoutLink.waitFor({ state: 'visible' });
    }

    async close() {
        await this.clickElement(this.closeButton);
        await this.logoutLink.waitFor({ state: 'hidden' });
    }

    async clickAllItems() {
        await this.open();
        await this.clickElement(this.allItemsLink);
    }

    async clickAbout() {
        await this.open();
        await this.clickElement(this.aboutLink);
    }

    async logout() {
        await this.open();
        await this.clickElement(this.logoutLink);
    }

    async resetAppState() {
        await this.open();
        await this.clickElement(this.resetAppStateLink);
    }
}

export default SidebarMenu;
