import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATA_PATH = path.resolve(__dirname, '../testdata/apiData.json');

export class DataHelper {
    constructor(filePath = DEFAULT_DATA_PATH) {
        this.filePath = filePath;
    }

    readData() {
        try {
            if (fs.existsSync(this.filePath)) {
                const content = fs.readFileSync(this.filePath, 'utf-8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error(`[DataHelper] Error reading ${this.filePath}:`, error.message);
        }
        return {};
    }

    writeData(data) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`[DataHelper] Error writing to ${this.filePath}:`, error.message);
        }
    }

    recordPutUpdate(putDetails) {
        const currentData = this.readData();
        if (!currentData.currentExecution) {
            currentData.currentExecution = {};
        }

        currentData.currentExecution.lastPutUpdate = {
            replacedIsbn: putDetails.oldIsbn,
            newIsbn: putDetails.newIsbn,
            userId: putDetails.userId,
            responseStatus: putDetails.status,
            updatedAt: putDetails.updatedAt,
            updatedBooksInCollection: putDetails.updatedBooks
        };

        this.writeData(currentData);
        console.log(`[DataHelper] testdata/apiData.json successfully updated for PUT request (Replaced: ${putDetails.oldIsbn} -> New: ${putDetails.newIsbn})`);
    }

    getLastPutUpdate() {
        const data = this.readData();
        return data?.currentExecution?.lastPutUpdate || null;
    }
}

export default DataHelper;

