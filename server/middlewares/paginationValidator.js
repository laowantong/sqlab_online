import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET } from '../../public/utils/constants.js';

/**
 * Middleware to validate pagination parameters in the request.
 * Validates 'limit' and 'offset' query parameters.
 * Sets default values if not provided.
 */
export function validatePagination(req, res, next) {
    // Validate and set default limit
    req.limit = Number(req.query.limit ?? DEFAULT_PAGE_LIMIT);
    if (!Number.isInteger(req.limit) || req.limit <= 0) {
        return res.status(400).json({ error: 'Invalid limit' });
    }

    // Validate and set default offset
    req.offset = Number(req.query.offset ?? DEFAULT_PAGE_OFFSET);
    if (!Number.isInteger(req.offset) || req.offset < 0) {
        return res.status(400).json({ error: 'Invalid offset' });
    }

    // Note that limit and offset are set as properties on the request object
    // and not as query parameters, which avoid them being converted to strings
    // in the database query. The route handler is sure to receive them as numbers.
    next();
}
