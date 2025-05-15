import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initializes the test database by executing the SQL dump file.
 */
export async function setupTestDatabase() {
    try {
        const dumpFilePath = path.join(__dirname, 'testDatabase.sql');
        const configPath = path.join(__dirname, 'testDatabaseConfig.cnf');
        const command = `mysql --defaults-file="${configPath}" < "${dumpFilePath}"`;
        await execPromise(command);
    } catch (error) {
        console.error('Error initializing the test database:', error);
    }
}
