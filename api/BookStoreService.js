import BaseApiClient from './BaseApiClient.js';
import DataHelper from './DataHelper.js';

class BookStoreService extends BaseApiClient {
    constructor(request, baseUrl) {
        super(request, baseUrl);
        this.dataHelper = new DataHelper();
    }

    async getAllBooks() {
        return await this.get('/BookStore/v1/Books');
    }

    async getBookByIsbn(isbn) {
        return await this.get(`/BookStore/v1/Book?ISBN=${isbn}`);
    }

    async addBookToCollection(userId, isbn, token = null) {
        return await this.post('/BookStore/v1/Books', {
            headers: this.getAuthHeader(token),
            data: {
                userId,
                collectionOfIsbns: [
                    { isbn }
                ]
            }
        });
    }

    /**
     * Replaces an old ISBN in user collection with a new ISBN (PUT request).
     * Automatically updates and persists the changed data into testdata/apiData.json.
     */
    async updateBookInCollection(oldIsbn, newIsbn, userId, token = null) {
        const response = await this.put(`/BookStore/v1/Books/${oldIsbn}`, {
            headers: this.getAuthHeader(token),
            data: {
                userId,
                isbn: newIsbn
            }
        });

        const status = response.status();
        let body = null;
        try {
            body = await response.json();
        } catch {
            body = null;
        }

        // Persist PUT call changes directly into testdata/apiData.json
        this.dataHelper.recordPutUpdate({
            oldIsbn,
            newIsbn,
            userId,
            status,
            updatedAt: new Date().toISOString(),
            updatedBooks: body?.books || []
        });

        return response;
    }

    async deleteBookFromCollection(userId, isbn, token = null) {
        return await this.delete('/BookStore/v1/Book', {
            headers: this.getAuthHeader(token),
            data: {
                userId,
                isbn
            }
        });
    }

    async deleteAllBooksFromCollection(userId, token = null) {
        return await this.delete(`/BookStore/v1/Books?UserId=${userId}`, {
            headers: this.getAuthHeader(token)
        });
    }
}

export default BookStoreService;

