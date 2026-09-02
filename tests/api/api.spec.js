import { test, expect } from '@playwright/test';

const BASE_URL = 'https://demoqa.com';

let userId = '';
let token = '';
let isbn1 = '';
let isbn2 = '';

const username = `user_${Date.now()}`;
const password = 'Password123!@#';

test.describe.serial('DemoQA API Testing - Positive & Negative Scenarios', () => {

    test('1. [Positive - 200] GET /BookStore/v1/Books - Get All Books', async ({ request }) => {
        console.log('\n========================================');
        console.log('1. [Positive] Fetching all books...');
        
        const response = await request.get(`${BASE_URL}/BookStore/v1/Books`);
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Total Books Found:', body.books?.length);
        console.log('First Book Details:', JSON.stringify(body.books?.[0], null, 2));

        isbn1 = body.books[0].isbn;
        isbn2 = body.books[1].isbn;

        expect(status).toBe(200);
        expect(body.books.length).toBeGreaterThan(0);
    });

    test('2. [Positive - 200] GET /BookStore/v1/Book - Get Single Book by Valid ISBN', async ({ request }) => {
        console.log('\n========================================');
        console.log(`2. [Positive] Fetching single book for ISBN: ${isbn1}...`);

        const response = await request.get(`${BASE_URL}/BookStore/v1/Book?ISBN=${isbn1}`);
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Book Title:', body.title);
        console.log('Book Author:', body.author);
        console.log('Full Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(200);
        expect(body.isbn).toBe(isbn1);
    });

    test('3. [Negative - 400] GET /BookStore/v1/Book - Query Invalid / Non-Existent ISBN', async ({ request }) => {
        console.log('\n========================================');
        console.log('3. [Negative] Querying invalid ISBN 9999999999999...');

        const response = await request.get(`${BASE_URL}/BookStore/v1/Book?ISBN=9999999999999`);
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Error Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(400);
        expect(body.code).toBe('1205');
        expect(body.message).toContain('not available in Books Collection');
    });

    test('4. [Negative - 400] POST /Account/v1/User - Reject Weak Password', async ({ request }) => {
        console.log('\n========================================');
        console.log('4. [Negative] Creating user with weak password "12345"...');

        const response = await request.post(`${BASE_URL}/Account/v1/User`, {
            data: {
                userName: `weak_${Date.now()}`,
                password: '12345'
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Error Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(400);
        expect(body.code).toBe('1300');
        expect(body.message).toContain('Passwords must have');
    });

    test('5. [Positive - 201] POST /Account/v1/User - Create New User with Valid Data', async ({ request }) => {
        console.log('\n========================================');
        console.log(`5. [Positive] Creating User with Username: ${username}...`);

        const response = await request.post(`${BASE_URL}/Account/v1/User`, {
            data: {
                userName: username,
                password: password
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Created User Response:', JSON.stringify(body, null, 2));

        userId = body.userID;

        expect(status).toBe(201);
        expect(body.username).toBe(username);
        expect(userId).toBeTruthy();
    });

    test('6. [Negative - 400/406] POST /Account/v1/User - Reject Duplicate Username', async ({ request }) => {
        console.log('\n========================================');
        console.log(`6. [Negative] Attempting to create duplicate user: ${username}...`);

        const response = await request.post(`${BASE_URL}/Account/v1/User`, {
            data: {
                userName: username,
                password: password
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Duplicate User Error Response:', JSON.stringify(body, null, 2));

        expect([400, 406]).toContain(status);
        expect(body.code).toBe('1204');
        expect(body.message).toBe('User exists!');
    });

    test('7. [Positive - 200] POST /Account/v1/GenerateToken - Generate Auth Token', async ({ request }) => {
        console.log('\n========================================');
        console.log(`7. [Positive] Generating Token for User: ${username}...`);

        const response = await request.post(`${BASE_URL}/Account/v1/GenerateToken`, {
            data: {
                userName: username,
                password: password
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Token Status:', body.status);
        console.log('Token Result:', body.result);
        console.log('Generated Token:', body.token);

        token = body.token;

        expect(status).toBe(200);
        expect(body.status).toBe('Success');
        expect(token).toBeTruthy();
    });

    test('8. [Negative - 200 Failed] POST /Account/v1/GenerateToken - Fail Token on Wrong Password', async ({ request }) => {
        console.log('\n========================================');
        console.log(`8. [Negative] Attempting to generate token with wrong password...`);

        const response = await request.post(`${BASE_URL}/Account/v1/GenerateToken`, {
            data: {
                userName: username,
                password: 'WrongPassword@123'
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Failed Token Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(200);
        expect(body.status).toBe('Failed');
        expect(body.token).toBeNull();
    });

    test('9. [Positive - 200] POST /Account/v1/Authorized - Check User Authorization', async ({ request }) => {
        console.log('\n========================================');
        console.log(`9. [Positive] Checking Authorization for: ${username}...`);

        const response = await request.post(`${BASE_URL}/Account/v1/Authorized`, {
            data: {
                userName: username,
                password: password
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Is Authorized?:', body);

        expect(status).toBe(200);
        expect(body).toBe(true);
    });

    test('10. [Negative - 404] POST /Account/v1/Authorized - Unauthorized on Invalid Password', async ({ request }) => {
        console.log('\n========================================');
        console.log(`10. [Negative] Checking Authorization with incorrect password...`);

        const response = await request.post(`${BASE_URL}/Account/v1/Authorized`, {
            data: {
                userName: username,
                password: 'IncorrectPassword@999'
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Authorization Error Response:', JSON.stringify(body, null, 2));

        expect([200, 404]).toContain(status);
        if (status === 200) {
            expect(body).toBe(false);
        } else {
            expect(body.message).toContain('not found');
        }
    });

    test('11. [Negative - 401] GET /Account/v1/User/{UUID} - Reject Profile Request Without Token', async ({ request }) => {
        console.log('\n========================================');
        console.log(`11. [Negative] Fetching Profile without Bearer token...`);

        const response = await request.get(`${BASE_URL}/Account/v1/User/${userId}`);
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Unauthorized Profile Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(401);
        expect(body.code).toBe('1200');
        expect(body.message).toBe('User not authorized!');
    });

    test('12. [Positive - 200] GET /Account/v1/User/{UUID} - Get User Profile with Valid Token', async ({ request }) => {
        console.log('\n========================================');
        console.log(`12. [Positive] Fetching Profile for User ID: ${userId} with token...`);

        const response = await request.get(`${BASE_URL}/Account/v1/User/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('User Profile:', JSON.stringify(body, null, 2));

        expect(status).toBe(200);
        expect(body.userId).toBe(userId);
        expect(body.username).toBe(username);
    });

    test('13. [Negative - 401] POST /BookStore/v1/Books - Reject Adding Book Without Token', async ({ request }) => {
        console.log('\n========================================');
        console.log('13. [Negative] Attempting to add book without Authorization token...');

        const response = await request.post(`${BASE_URL}/BookStore/v1/Books`, {
            data: {
                userId: userId,
                collectionOfIsbns: [
                    { isbn: isbn1 }
                ]
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Unauthorized Add Book Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(401);
        expect(body.code).toBe('1200');
        expect(body.message).toBe('User not authorized!');
    });

    test('14. [Positive - 201] POST /BookStore/v1/Books - Add Book to User Collection', async ({ request }) => {
        console.log('\n========================================');
        console.log(`14. [Positive] Adding Book (ISBN: ${isbn1}) to User Collection...`);

        const response = await request.post(`${BASE_URL}/BookStore/v1/Books`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                userId: userId,
                collectionOfIsbns: [
                    { isbn: isbn1 }
                ]
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Add Book Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(201);
        expect(body.books[0].isbn).toBe(isbn1);
    });

    test('15. [Negative - 400] POST /BookStore/v1/Books - Reject Adding Duplicate Book to Collection', async ({ request }) => {
        console.log('\n========================================');
        console.log(`15. [Negative] Attempting to add already existing Book (ISBN: ${isbn1}) again...`);

        const response = await request.post(`${BASE_URL}/BookStore/v1/Books`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                userId: userId,
                collectionOfIsbns: [
                    { isbn: isbn1 }
                ]
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Duplicate Book Addition Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(400);
        expect(body.code).toBe('1210');
        expect(body.message).toContain("ISBN already present in the User's Collection!");
    });

    test('16. [Positive - 200] PUT /BookStore/v1/Books/{ISBN} - Update / Replace Book in Collection', async ({ request }) => {
        console.log('\n========================================');
        console.log(`16. [Positive] Replacing old ISBN (${isbn1}) with new ISBN (${isbn2})...`);

        const response = await request.put(`${BASE_URL}/BookStore/v1/Books/${isbn1}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                userId: userId,
                isbn: isbn2
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Update Book Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(200);
        expect(body.books.some(b => b.isbn === isbn2)).toBe(true);
    });

    test('17. [Negative - 401] DELETE /BookStore/v1/Book - Reject Deleting Book Without Token', async ({ request }) => {
        console.log('\n========================================');
        console.log(`17. [Negative] Attempting to delete book without Bearer token...`);

        const response = await request.delete(`${BASE_URL}/BookStore/v1/Book`, {
            data: {
                userId: userId,
                isbn: isbn2
            }
        });
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Unauthorized Delete Book Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(401);
        expect(body.code).toBe('1200');
        expect(body.message).toBe('User not authorized!');
    });

    test('18. [Positive - 204] DELETE /BookStore/v1/Book - Delete Single Book from Collection', async ({ request }) => {
        console.log('\n========================================');
        console.log(`18. [Positive] Deleting Book (ISBN: ${isbn2}) from Collection with token...`);

        const response = await request.delete(`${BASE_URL}/BookStore/v1/Book`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                userId: userId,
                isbn: isbn2
            }
        });
        const status = response.status();

        console.log('Status Code:', status);
        console.log('Book successfully deleted from collection!');

        expect(status).toBe(204);
    });

    test('19. [Positive - 204] DELETE /BookStore/v1/Books - Delete All Books from Collection', async ({ request }) => {
        console.log('\n========================================');
        console.log(`19. [Positive] Deleting all books for User ID: ${userId}...`);

        const response = await request.delete(`${BASE_URL}/BookStore/v1/Books?UserId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const status = response.status();

        console.log('Status Code:', status);
        console.log('All books deleted from collection!');

        expect(status).toBe(204);
    });

    test('20. [Negative - 401] DELETE /Account/v1/User/{UUID} - Reject Deleting User Without Token', async ({ request }) => {
        console.log('\n========================================');
        console.log(`20. [Negative] Attempting to delete user without Bearer token...`);

        const response = await request.delete(`${BASE_URL}/Account/v1/User/${userId}`);
        const status = response.status();
        const body = await response.json();

        console.log('Status Code:', status);
        console.log('Unauthorized Delete User Response:', JSON.stringify(body, null, 2));

        expect(status).toBe(401);
        expect(body.code).toBe('1200');
        expect(body.message).toBe('User not authorized!');
    });

    test('21. [Positive - 204] DELETE /Account/v1/User/{UUID} - Delete User Account with Token', async ({ request }) => {
        console.log('\n========================================');
        console.log(`21. [Positive] Deleting User Account: ${userId} with token...`);

        const response = await request.delete(`${BASE_URL}/Account/v1/User/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const status = response.status();

        console.log('Status Code:', status);
        console.log('User Account successfully deleted!');

        expect([200, 204]).toContain(status);
    });

});
