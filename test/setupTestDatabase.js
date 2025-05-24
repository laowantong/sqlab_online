import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConfig } from './testDatabaseConfig.js';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initializes the test database by executing the SQL dump file.
 */
export async function setupTestDatabase() {
    try {
        const dumpFilePath = path.join(__dirname, 'testDatabase.sql');
        const command = `mysql --skip_ssl -h${dbConfig.host} -P${dbConfig.port} -u${dbConfig.user} -p${dbConfig.password} < "${dumpFilePath}"`;
        await execPromise(command);

    } catch (error) {
        console.error('Error initializing the test database:', error);
        throw error;
    }
}