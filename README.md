# SauceDemo UI & DemoQA API Automation Framework

[![Playwright Tests](https://img.shields.io/badge/Playwright-1.62.1-green.svg)](https://playwright.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![Jenkins CI/CD](https://img.shields.io/badge/Jenkins-CI%2FCD-red.svg)](https://www.jenkins.io/)
[![Allure Report](https://img.shields.io/badge/Allure-Report-orange.svg)](https://allurereport.org/)

An enterprise-grade test automation framework built with **Playwright**, implementing **Page Object Model (POM)** for UI testing on [SauceDemo](https://www.saucedemo.com/) and **Service Object Model (SOM)** for REST API testing on [DemoQA BookStore API](https://demoqa.com).

The framework includes **Docker** containerization, **Allure** reporting, and automated **Jenkins CI/CD** with GitHub Webhook triggers.

---

## 🚀 Features

- **End-to-End & Modular UI Automation**:
  - Full purchase journey (E2E) covering login, sort, cart, multi-step checkout, and logout.
  - Granular module-level suites for Login, Inventory, Cart, and Checkout.
  - Resilient element targeting using `data-test` attributes.
- **Robust REST API Testing**:
  - Full CRUD lifecycle (POST, GET, PUT, DELETE) for user accounts and book collections.
  - Positive and negative validations (status codes `200`, `201`, `204`, `400`, `401`, `404`, `406`).
  - Dynamic state management and data persistence.
- **Reporting & Observability**:
  - Detailed Playwright HTML reports.
  - Interactive **Allure Reports** with step-by-step attachments and full-page screenshots.
- **CI/CD & Docker Deployment**:
  - Containerized execution via `Dockerfile` and `docker-compose.yml`.
  - Automated `Jenkinsfile` pipeline that builds, tests, archives reports, and automatically deploys live dashboard servers on Docker when CI passes.

---

## 📁 Project Architecture

```
SauceDemo-Automation/
├── api/                  # Service Object Model for REST APIs
│   ├── BaseApiClient.js  # HTTP request client wrapper
│   ├── AccountService.js # User registration & auth endpoints
│   ├── BookStoreService.js # Book catalog & collection endpoints
│   └── DataHelper.js     # State persistence helper
├── pages/                # Page Object Model for SauceDemo UI
│   ├── BasePage.js       # Base class with reusable Playwright actions
│   ├── LoginPage.js      # Authentication locators & actions
│   ├── InventoryPage.js  # Product catalog & sorting
│   ├── CartPage.js       # Shopping cart operations
│   ├── CheckoutStepOnePage.js # Customer checkout information
│   ├── CheckoutStepTwoPage.js # Pricing overview & calculation checks
│   ├── CheckoutCompletePage.js# Confirmation verification
│   ├── ProductDetailsPage.js  # Individual product page
│   └── SidebarMenu.js    # Slide-out navigation menu
├── testdata/             # Centralized JSON test datasets
│   ├── apiData.json
│   ├── checkoutData.json
│   ├── loginData.json
│   └── productsData.json
├── tests/                # Test specifications (47 tests total)
│   ├── api/              # API test suites (21 tests)
│   ├── endtoend/         # Complete E2E user journeys (1 test)
│   └── module/           # Component-level tests (25 tests)
├── Dockerfile            # Container image with Playwright & Java
├── docker-compose.yml    # Multi-container test runner & report deployment
├── Jenkinsfile           # Declarative CI/CD pipeline
├── JENKINS_SETUP.md      # Jenkins & GitHub Webhook setup guide
├── package.json          # Dependencies & execution scripts
└── playwright.config.js  # Playwright runner configuration
```

---

## 💻 Local Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Install Dependencies
```bash
npm install
npx playwright install --with-deps
```

### 3. Run Tests
```bash
# Run all tests (UI + API)
npm test

# Run UI tests only
npm run test:ui

# Run API tests only
npm run test:api

# Run in headed mode (visible browser)
npm run test:headed
```

### 4. View Reports
```bash
# View Playwright HTML Report
npm run report

# Generate and view Allure Report
npm run test:allure
npm run allure:open
```

---

## 🐳 Running with Docker

You can run the entire test suite without installing local Node.js or browser dependencies:

```bash
# Build Docker image
npm run docker:build

# Run all tests in Docker
npm run docker:test

# Run API tests in Docker
npm run docker:test:api

# Run UI tests in Docker
npm run docker:test:ui

# Deploy live reporting dashboards in background
npm run docker:deploy
```

Once deployed, access the live dashboards:
- **Allure Dashboard**: `http://localhost:5050`
- **Playwright HTML Report**: `http://localhost:9323`

To stop and remove containers:
```bash
npm run docker:down
```

---

## ⚙️ Jenkins CI/CD Pipeline

The included [`Jenkinsfile`](./Jenkinsfile) provides automated CI/CD:
1. **Trigger**: Automatic execution via GitHub Webhook on push.
2. **Build**: Builds Docker test runner image.
3. **Test**: Executes 47 tests inside an isolated container.
4. **Publish**: Archives failure screenshots and renders Allure & Playwright HTML reports.
5. **Deploy**: **Conditionally deploys** reporting servers on Docker when all tests pass!

For detailed instructions on configuring Jenkins plugins and setting up the GitHub webhook, refer to [`JENKINS_SETUP.md`](./JENKINS_SETUP.md).

> [!NOTE]
> **CI/CD Webhook Trigger**: Automated pipeline execution and Docker container deployment configured for GitHub `push` events on branch `main`.

