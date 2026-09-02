import BaseApiClient from './BaseApiClient.js';

class AccountService extends BaseApiClient {
    constructor(request, baseUrl) {
        super(request, baseUrl);
    }

    async createUser(userName, password) {
        return await this.post('/Account/v1/User', {
            data: { userName, password }
        });
    }

    async generateToken(userName, password) {
        return await this.post('/Account/v1/GenerateToken', {
            data: { userName, password }
        });
    }

    async checkAuthorization(userName, password) {
        return await this.post('/Account/v1/Authorized', {
            data: { userName, password }
        });
    }

    async getUserProfile(userId, token = null) {
        return await this.get(`/Account/v1/User/${userId}`, {
            headers: this.getAuthHeader(token)
        });
    }

    async deleteUser(userId, token = null) {
        return await this.delete(`/Account/v1/User/${userId}`, {
            headers: this.getAuthHeader(token)
        });
    }
}

export default AccountService;

