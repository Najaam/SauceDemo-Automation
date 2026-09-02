class BaseApiClient {
    constructor(request, baseUrl = 'https://demoqa.com') {
        this.request = request;
        this.baseUrl = baseUrl;
    }

    getAuthHeader(token) {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async get(endpoint, options = {}) {
        return await this.request.get(`${this.baseUrl}${endpoint}`, options);
    }

    async post(endpoint, options = {}) {
        return await this.request.post(`${this.baseUrl}${endpoint}`, options);
    }

    async put(endpoint, options = {}) {
        return await this.request.put(`${this.baseUrl}${endpoint}`, options);
    }

    async delete(endpoint, options = {}) {
        return await this.request.delete(`${this.baseUrl}${endpoint}`, options);
    }
}

export default BaseApiClient;

