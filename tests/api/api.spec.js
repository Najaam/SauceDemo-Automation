import { test, expect } from '@playwright/test';
import AccountService from '../../api/AccountService.js';
import BookStoreService from '../../api/BookStoreService.js';
import DataHelper from '../../api/DataHelper.js';

let accountService;
let bookStoreService;
const dataHelper = new DataHelper();
const apiData = dataHelper.readData();

let userId = '';
let token = '';
let isbn1 = '';
let isbn2 = '';

const username = `user_${Date.now()}`;
const password = apiData.defaultPassword || 'Password123!@#';

test.describe.serial('DemoQA API Testing - Page/Service Object Model with Test Steps', () => {

    test.beforeEach(async ({ request }) => {
        accountService = new AccountService(request);
        bookStoreService = new BookStoreService(request);
    });

    test('1. [Positive - 200] GET /BookStore/v1/Books - Get All Books', async () => {
        let response;
        let body;
        let status;

        await test.step('Send GET request to fetch all books', async () => {
            console.log('\n========================================');
            console.log('1. [Positive] Fetching all books...');
            response = await bookStoreService.getAllBooks();
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Total Books Found:', body.books?.length);
            console.log('First Book Details:', JSON.stringify(body.books?.[0], null, 2));

            isbn1 = body.books[0].isbn;
            isbn2 = body.books[1].isbn;
        });

        await test.step('Validate response status 200 and books array is not empty', async () => {
            expect(status).toBe(200);
            expect(body.books.length).toBeGreaterThan(0);
        });
    });

    test('2. [Positive - 200] GET /BookStore/v1/Book - Get Single Book by Valid ISBN', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send GET request for single book with ISBN: ${isbn1}`, async () => {
            console.log('\n========================================');
            console.log(`2. [Positive] Fetching single book for ISBN: ${isbn1}...`);
            response = await bookStoreService.getBookByIsbn(isbn1);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Book Title:', body.title);
            console.log('Book Author:', body.author);
            console.log('Full Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate response status 200 and matching ISBN', async () => {
            expect(status).toBe(200);
            expect(body.isbn).toBe(isbn1);
        });
    });

    test('3. [Negative - 400] GET /BookStore/v1/Book - Query Invalid / Non-Existent ISBN', async () => {
        const nonExistentIsbn = apiData.nonExistentIsbn || '9999999999999';
        let response;
        let body;
        let status;

        await test.step(`Send GET request with non-existent ISBN: ${nonExistentIsbn}`, async () => {
            console.log('\n========================================');
            console.log(`3. [Negative] Querying invalid ISBN ${nonExistentIsbn}...`);
            response = await bookStoreService.getBookByIsbn(nonExistentIsbn);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Error Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate error status 400 and error code 1205', async () => {
            expect(status).toBe(400);
            expect(body.code).toBe('1205');
            expect(body.message).toContain('not available in Books Collection');
        });
    });

    test('4. [Negative - 400] POST /Account/v1/User - Reject Weak Password', async () => {
        const weakPassword = apiData.weakPassword || '12345';
        let response;
        let body;
        let status;

        await test.step(`Send POST request to create user with weak password "${weakPassword}"`, async () => {
            console.log('\n========================================');
            console.log(`4. [Negative] Creating user with weak password "${weakPassword}"...`);
            response = await accountService.createUser(`weak_${Date.now()}`, weakPassword);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Error Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate error status 400 and password validation error code 1300', async () => {
            expect(status).toBe(400);
            expect(body.code).toBe('1300');
            expect(body.message).toContain('Passwords must have');
        });
    });

    test('5. [Positive - 201] POST /Account/v1/User - Create New User with Valid Data', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send POST request to create user "${username}"`, async () => {
            console.log('\n========================================');
            console.log(`5. [Positive] Creating User with Username: ${username}...`);
            response = await accountService.createUser(username, password);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Created User Response:', JSON.stringify(body, null, 2));

            userId = body.userID;
        });

        await test.step('Validate status 201, username match, and valid userId returned', async () => {
            expect(status).toBe(201);
            expect(body.username).toBe(username);
            expect(userId).toBeTruthy();
        });
    });

    test('6. [Negative - 400/406] POST /Account/v1/User - Reject Duplicate Username', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send POST request to create duplicate user "${username}"`, async () => {
            console.log('\n========================================');
            console.log(`6. [Negative] Attempting to create duplicate user: ${username}...`);
            response = await accountService.createUser(username, password);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Duplicate User Error Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate duplicate user rejection status and code 1204', async () => {
            expect([400, 406]).toContain(status);
            expect(body.code).toBe('1204');
            expect(body.message).toBe('User exists!');
        });
    });

    test('7. [Positive - 200] POST /Account/v1/GenerateToken - Generate Auth Token', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send POST request to generate token for "${username}"`, async () => {
            console.log('\n========================================');
            console.log(`7. [Positive] Generating Token for User: ${username}...`);
            response = await accountService.generateToken(username, password);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Token Status:', body.status);
            console.log('Token Result:', body.result);
            console.log('Generated Token:', body.token);

            token = body.token;
        });

        await test.step('Validate status 200, success status, and valid bearer token', async () => {
            expect(status).toBe(200);
            expect(body.status).toBe('Success');
            expect(token).toBeTruthy();
        });
    });

    test('8. [Negative - 200 Failed] POST /Account/v1/GenerateToken - Fail Token on Wrong Password', async () => {
        const invalidPassword = apiData.invalidPassword || 'WrongPassword@123';
        let response;
        let body;
        let status;

        await test.step('Send POST request to generate token with incorrect password', async () => {
            console.log('\n========================================');
            console.log('8. [Negative] Attempting to generate token with wrong password...');
            response = await accountService.generateToken(username, invalidPassword);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Failed Token Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate response status 200 with Failed status and null token', async () => {
            expect(status).toBe(200);
            expect(body.status).toBe('Failed');
            expect(body.token).toBeNull();
        });
    });

    test('9. [Positive - 200] POST /Account/v1/Authorized - Check User Authorization', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send POST request to verify authorization for "${username}"`, async () => {
            console.log('\n========================================');
            console.log(`9. [Positive] Checking Authorization for: ${username}...`);
            response = await accountService.checkAuthorization(username, password);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Is Authorized?:', body);
        });

        await test.step('Validate status 200 and authorization boolean is true', async () => {
            expect(status).toBe(200);
            expect(body).toBe(true);
        });
    });

    test('10. [Negative - 404] POST /Account/v1/Authorized - Unauthorized on Invalid Password', async () => {
        let response;
        let body;
        let status;

        await test.step('Send POST request to verify authorization with wrong password', async () => {
            console.log('\n========================================');
            console.log('10. [Negative] Checking Authorization with incorrect password...');
            response = await accountService.checkAuthorization(username, 'IncorrectPassword@999');
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Authorization Error Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate response status and unauthorized / not found indication', async () => {
            expect([200, 404]).toContain(status);
            if (status === 200) {
                expect(body).toBe(false);
            } else {
                expect(body.message).toContain('not found');
            }
        });
    });

    test('11. [Negative - 401] GET /Account/v1/User/{UUID} - Reject Profile Request Without Token', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send GET profile request for userId ${userId} without token`, async () => {
            console.log('\n========================================');
            console.log('11. [Negative] Fetching Profile without Bearer token...');
            response = await accountService.getUserProfile(userId, null);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Unauthorized Profile Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate 401 Unauthorized status and error message', async () => {
            expect(status).toBe(401);
            expect(body.code).toBe('1200');
            expect(body.message).toBe('User not authorized!');
        });
    });

    test('12. [Positive - 200] GET /Account/v1/User/{UUID} - Get User Profile with Valid Token', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send GET profile request with valid Bearer token for userId: ${userId}`, async () => {
            console.log('\n========================================');
            console.log(`12. [Positive] Fetching Profile for User ID: ${userId} with token...`);
            response = await accountService.getUserProfile(userId, token);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('User Profile:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate status 200 and profile attributes match user', async () => {
            expect(status).toBe(200);
            expect(body.userId).toBe(userId);
            expect(body.username).toBe(username);
        });
    });

    test('13. [Negative - 401] POST /BookStore/v1/Books - Reject Adding Book Without Token', async () => {
        let response;
        let body;
        let status;

        await test.step('Send POST add book request without Bearer authorization token', async () => {
            console.log('\n========================================');
            console.log('13. [Negative] Attempting to add book without Authorization token...');
            response = await bookStoreService.addBookToCollection(userId, isbn1, null);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Unauthorized Add Book Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate 401 Unauthorized error code 1200', async () => {
            expect(status).toBe(401);
            expect(body.code).toBe('1200');
            expect(body.message).toBe('User not authorized!');
        });
    });

    test('14. [Positive - 201] POST /BookStore/v1/Books - Add Book to User Collection', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send POST request to add Book (ISBN: ${isbn1}) with Bearer token`, async () => {
            console.log('\n========================================');
            console.log(`14. [Positive] Adding Book (ISBN: ${isbn1}) to User Collection...`);
            response = await bookStoreService.addBookToCollection(userId, isbn1, token);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Add Book Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate status 201 and added ISBN in response collection', async () => {
            expect(status).toBe(201);
            expect(body.books[0].isbn).toBe(isbn1);
        });
    });

    test('15. [Negative - 400] POST /BookStore/v1/Books - Reject Adding Duplicate Book to Collection', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send POST request to add already existing Book (ISBN: ${isbn1}) again`, async () => {
            console.log('\n========================================');
            console.log(`15. [Negative] Attempting to add already existing Book (ISBN: ${isbn1}) again...`);
            response = await bookStoreService.addBookToCollection(userId, isbn1, token);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Duplicate Book Addition Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate 400 Bad Request and duplicate ISBN error code 1210', async () => {
            expect(status).toBe(400);
            expect(body.code).toBe('1210');
            expect(body.message).toContain("ISBN already present in the User's Collection!");
        });
    });

    test('16. [Positive - 200] PUT /BookStore/v1/Books/{ISBN} - Update / Replace Book in Collection (Persists to Data File)', async () => {
        let response;
        let body;
        let status;
        let lastPutUpdate;

        await test.step(`Send PUT request to replace old ISBN (${isbn1}) with new ISBN (${isbn2}) and persist to testdata/apiData.json`, async () => {
            console.log('\n========================================');
            console.log(`16. [Positive] Replacing old ISBN (${isbn1}) with new ISBN (${isbn2})...`);

            // Execute PUT request via BookStoreService (automatically updates testdata/apiData.json)
            response = await bookStoreService.updateBookInCollection(isbn1, isbn2, userId, token);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Update Book Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate PUT API response status 200 and updated book collection', async () => {
            expect(status).toBe(200);
            expect(body.books.some(b => b.isbn === isbn2)).toBe(true);
        });

        await test.step('Verify that testdata/apiData.json was persisted with the updated PUT details', async () => {
            lastPutUpdate = dataHelper.getLastPutUpdate();
            console.log('Persisted Data File Record:', JSON.stringify(lastPutUpdate, null, 2));

            expect(lastPutUpdate).not.toBeNull();
            expect(lastPutUpdate.replacedIsbn).toBe(isbn1);
            expect(lastPutUpdate.newIsbn).toBe(isbn2);
            expect(lastPutUpdate.userId).toBe(userId);
            expect(lastPutUpdate.responseStatus).toBe(200);
            expect(lastPutUpdate.updatedAt).toBeTruthy();
        });
    });

    test('17. [Negative - 401] DELETE /BookStore/v1/Book - Reject Deleting Book Without Token', async () => {
        let response;
        let body;
        let status;

        await test.step('Send DELETE book request without Bearer authorization token', async () => {
            console.log('\n========================================');
            console.log('17. [Negative] Attempting to delete book without Bearer token...');
            response = await bookStoreService.deleteBookFromCollection(userId, isbn2, null);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Unauthorized Delete Book Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate 401 Unauthorized error code 1200', async () => {
            expect(status).toBe(401);
            expect(body.code).toBe('1200');
            expect(body.message).toBe('User not authorized!');
        });
    });

    test('18. [Positive - 204] DELETE /BookStore/v1/Book - Delete Single Book from Collection', async () => {
        let response;
        let status;

        await test.step(`Send DELETE request to remove single Book (ISBN: ${isbn2}) with token`, async () => {
            console.log('\n========================================');
            console.log(`18. [Positive] Deleting Book (ISBN: ${isbn2}) from Collection with token...`);
            response = await bookStoreService.deleteBookFromCollection(userId, isbn2, token);
            status = response.status();

            console.log('Status Code:', status);
            console.log('Book successfully deleted from collection!');
        });

        await test.step('Validate 204 No Content response status', async () => {
            expect(status).toBe(204);
        });
    });

    test('19. [Positive - 204] DELETE /BookStore/v1/Books - Delete All Books from Collection', async () => {
        let response;
        let status;

        await test.step(`Send DELETE request to delete all books for userId: ${userId} with token`, async () => {
            console.log('\n========================================');
            console.log(`19. [Positive] Deleting all books for User ID: ${userId}...`);
            response = await bookStoreService.deleteAllBooksFromCollection(userId, token);
            status = response.status();

            console.log('Status Code:', status);
            console.log('All books deleted from collection!');
        });

        await test.step('Validate 204 No Content response status', async () => {
            expect(status).toBe(204);
        });
    });

    test('20. [Negative - 401] DELETE /Account/v1/User/{UUID} - Reject Deleting User Without Token', async () => {
        let response;
        let body;
        let status;

        await test.step(`Send DELETE user request for userId: ${userId} without token`, async () => {
            console.log('\n========================================');
            console.log('20. [Negative] Attempting to delete user without Bearer token...');
            response = await accountService.deleteUser(userId, null);
            status = response.status();
            body = await response.json();

            console.log('Status Code:', status);
            console.log('Unauthorized Delete User Response:', JSON.stringify(body, null, 2));
        });

        await test.step('Validate 401 Unauthorized status code 1200', async () => {
            expect(status).toBe(401);
            expect(body.code).toBe('1200');
            expect(body.message).toBe('User not authorized!');
        });
    });

    test('21. [Positive - 204] DELETE /Account/v1/User/{UUID} - Delete User Account with Token', async () => {
        let response;
        let status;

        await test.step(`Send DELETE request for user ${userId} with Bearer token`, async () => {
            console.log('\n========================================');
            console.log(`21. [Positive] Deleting User Account: ${userId} with token...`);
            response = await accountService.deleteUser(userId, token);
            status = response.status();

            console.log('Status Code:', status);
            console.log('User Account successfully deleted!');
        });

        await test.step('Validate user deletion status (200 or 204)', async () => {
            expect([200, 204]).toContain(status);
        });
    });

});
