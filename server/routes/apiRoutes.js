import express from 'express';
const router = express.Router();

import { handleExecuteQuery } from '../controllers/queryController.js';
router.post('/execute-query', handleExecuteQuery);

import { validatePagination } from '../middlewares/paginationValidator.js';
import { handleQueryTableData } from '../controllers/tableDataController.js';
router.get('/table-data/:tableName', validatePagination, handleQueryTableData);

import { handleQueryMetadata } from '../controllers/metadataController.js';
router.get('/metadata/:name', handleQueryMetadata);

import { handleDecryptToken } from '../controllers/decryptionController.js';
router.get('/decrypt/:token', handleDecryptToken);

export default router;
