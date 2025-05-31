import express from 'express';
const router = express.Router();

import { handleExecuteQuery } from '../controllers/queryExecutionController.js';
router.post('/execute-query', handleExecuteQuery);

import { handleCheckQuery } from '../controllers/queryCheckController.js';
router.post('/check-query', handleCheckQuery);

import { validatePagination } from '../middlewares/paginationValidator.js';
import { handleQueryCoreTable } from '../controllers/coreTableController.js';
router.get('/table-data/:tableName', validatePagination, handleQueryCoreTable);

import { handleQueryMetadata } from '../controllers/metadataController.js';
router.get('/metadata/:name', handleQueryMetadata);

import { handleQueryUserData } from '../controllers/userDataController.js';
router.get('/user-data/:name', handleQueryUserData);

import { handleDecryptToken } from '../controllers/decryptionController.js';
router.get('/decrypt/:token', handleDecryptToken);

export default router;
