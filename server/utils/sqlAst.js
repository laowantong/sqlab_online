import { BLOCKED_PATTERNS, TWEAK_MAX_LENGTH } from './constants.js';

// Import the node-sql-parser library
import pkg from 'node-sql-parser';
const { Parser } = pkg;

// Create a parser instance
const parser = new Parser();

/**
 * Parse SQL text into an Abstract Syntax Tree (AST)
 * @param {string} sql - The SQL text to parse
 * @returns {object} - The response status and, if successful, the AST
 */
export function parseSqlToAst(sql) {
    try {
        return {
            success: true,
            ast: parser.astify(sql)
        };
    } catch (e) {
        return { success: false };
    }
}

/**
 * Append a placeholder as the last column of the final statement of a SQL AST
 * if and only if this statement is a SELECT. Note that the placeholder string
 * will be delimited by backticks.
 * @param {object|array} ast - The SQL AST to modify
 * @returns {object} - The response status and, if successful, the modified SQL text
 */
export function injectPlaceholderColumn(ast) {
    let final = ast;
    if (Array.isArray(ast)) {
        if (ast.length === 0) {
            return { 
                success: false,
                errorSlug: "EmptyAst"
            };
        }
        // The SQL text consists of multiple statements,
        // but we only care about the last one.
        final = ast[ast.length - 1];
    }

    // Check if the final statement is a SELECT
    if (final.type !== 'select') {
        return {
            success: false,
            errorSlug: "nonSelectFinalStatement"
        };
    }

    // Perform the insertion
    final.columns.push({
        expr: {
            type: 'column_ref',
            table: null,
            column: 'SQLAB_COLUMN_PLACEHOLDER'
        }
    });

    return {
        success: true,
        result: parser.sqlify(ast)
    };
}

/**
 * Extracts table names or aliases referenced in the FROM clause of a SQL query.
 * @param {Object} ast - The AST of the SQL query, guaranteed to be a single SELECT query.
 * @returns {Array<string>} Array of table names or aliases
 */
export function getTablesOfFromClause(ast) {
    if (!Array.isArray(ast.from)) {
        // Most dialects of SQL allow SELECT queries without a FROM clause, e.g., SELECT 1
        return [];
    }
    const result = ast.from.map(src => src.as || src.table);
    return result;
}

/**
 * Replaces all occurrences of the word "hash" in the formula with the actual table names
 * from the FROM clause of the SQL query.
 * @param {object} ast - The AST of the SQL query
 * @param {string} formula - The formula containing the word "hash"
 * @returns {object} - The response status and, if successful, the modified formula
 */
export function calculateFirstPassFormula(ast, formula) {
    const tablesOfFromClause = getTablesOfFromClause(ast);
    const hashMatches = formula.match(/(\w\.)?\bhash\b/g);
    
    if (!hashMatches) {
        return {
            success: true,
            formula
        };
    }
    
    const missingTablesCount = hashMatches.length - tablesOfFromClause.length;
    if (missingTablesCount > 0) {
        return {
            success: false,
            missingTablesCount
        };
    }
    
    formula = hashMatches.reduce((result, match, i) =>
        result.replace(match, tablesOfFromClause[i] + '.hash'), formula);
    
    return {
        success: true,
        formula
    };
}

/**
 * Replaces the placeholder '(0)' in the formula with a given value.
 * @param {string} firstPassFormula - The formula after the first pass
 * @param {string|number} tweakValue - The value to replace the placeholder with
 * @returns {object} - The response status and, if successful, the modified formula
 */
export function calculateSecondPassFormula(firstPassFormula, tweakValue) {
    const placeholderCount = (firstPassFormula.match(/\(0\)/g) || []).length;
    if (placeholderCount !== 1) {
        return {
            success: false,
            placeholderCount,
        };
    } else {
        return {
            success: true,
            formula: firstPassFormula.replace('(0)', `${tweakValue}`)
        };
    }
}

/**
 * Checks if the given tweak expression is safe for evaluation.
 * @param {string} expression - The expression to check
 * @returns {boolean} - True if the expression is safe, false otherwise
 */
export function isSafeForEvaluation(expression) {
    return (
        expression.length <= TWEAK_MAX_LENGTH
        &&
        BLOCKED_PATTERNS.every(bp => !bp.test(expression))
    );
}

/**
 * An IIFE (Immediately Invoked Function Expression) for encoding and decoding
 * non-ASCII characters in SQL queries. It maintains a shared state between the
 * encode and decode functions using two maps.
 * This is a workaround for the following issue in node-sql-parser:
 * https://github.com/taozhi8833998/node-sql-parser/issues/1606
 * As of v. 5.3.9, it has been fixed for PostgreSQL only:
 * https://github.com/taozhi8833998/node-sql-parser/pull/1732
 */
export const asciiMapper = (function () {
    const prefix = '__UNICODE__';

    // Memoization maps for encoding and decoding
    const charMap = new Map();
    const reverseMap = new Map();

    return {
        /**
         * Encodes non-ASCII characters to safe placeholders
         * @param {string} sql - Original SQL query
         * @returns {string} Encoded SQL
         */
        encode: (sql) => {
            return sql.replace(/[^\x00-\x7F]/g, (char) => {
                if (!charMap.has(char)) {
                    const placeholder = `${prefix}${char.codePointAt(0).toString(16)}_`;
                    charMap.set(char, placeholder);
                    reverseMap.set(placeholder, char);
                }
                return charMap.get(char);
            });
        },

        /**
         * Decodes placeholders back to original characters
         * @param {string} sql - SQL string to decode
         * @returns {string} Decoded SQL string
         */
        decode: (sql) => {
            if (!sql.includes(prefix)) return sql;
            reverseMap.forEach((char, placeholder) => {
                sql = sql.replace(new RegExp(placeholder, 'g'), char);
            });
            return sql;
        },
    };
}());
