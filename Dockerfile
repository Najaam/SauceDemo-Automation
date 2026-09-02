# Base image with Playwright pre-installed dependencies and browsers
FROM mcr.microsoft.com/playwright:v1.62.1-noble

# Install Java runtime (required for Allure report generation)
RUN apt-get update && \
    apt-get install -y --no-install-recommends default-jre-headless && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Set environment variables
ENV CI=true

# Default command to run Playwright test suite
CMD ["npm", "test"]

