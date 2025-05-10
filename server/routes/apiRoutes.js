import express from 'express';
const router = express.Router();

// Import controllers
import databaseController from '../controllers/databaseController.js';
import queryController from '../controllers/queryController.js';
import tableController from '../controllers/tableController.js';
import sqlabInfoController from '../controllers/sqlabInfoController.js';

// Routes for database information
router.get('/database-info', databaseController.getDatabaseInfo);

// Routes for query execution
router.post('/execute-query', queryController.executeQuery);

// Routes for table management
router.get('/list-tables', tableController.listTables);
router.get('/table-data/:tableName', tableController.getTableData);

router.get('/sqlab-info-value/:name', sqlabInfoController.getSqlabInfoValue);

export default router;
