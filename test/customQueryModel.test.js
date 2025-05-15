// TODO: instead of using an existing database, create dynamically a dedicated test database.
// It could be another instance of sqlab_island, whose dump is quite short.

import { expect } from "chai";
import { customQuery } from "../server/models/customQueryModel.js";
import { pool } from "../server/services/databaseService.js";

describe('customQuery for SELECT operations', () => {
    it('handles simple SELECT query correctly', async () => {
        const query = 'SELECT * FROM village';
        const result = await customQuery(query, 0, 10);
        expect(result.isArray).to.be.true;
        expect(result.total).to.equal(3);
        expect(result.columns).to.include('villageid');
        expect(result.columns).to.include('name');
        expect(result.columns).to.not.include('hash');
    });

    it('handles empty SELECT results correctly', async () => {
        const query = 'SELECT * FROM village WHERE villageid = 999';
        const result = await customQuery(query, 0, 10);
        expect(result.isArray).to.be.true;
        expect(result.total).to.equal(0);
        expect(result.columns).to.be.an('array').that.is.empty;
        expect(result.rows).to.be.an('array').that.is.empty;
    });

    it('filters hash columns from multiple tables in a JOIN', async () => {
        // Obviously, specifying all columns except the hash columns will not result
        // in any hash column in the result set! Replacing the columns with asterisk
        // reveals an error. TODO: fix it.
        const query = 'SELECT * FROM village v JOIN inhabitant i ON v.villageid = i.villageid';
        const result = await customQuery(query, 0, 20);
        expect(result.isArray).to.be.true;
        expect(result.columns).to.not.include('hash');
        expect(result.columns).to.not.include('v.hash');
        expect(result.columns).to.not.include('i.hash');
    });

    it('handles pagination correctly', async () => {
        const query = 'SELECT * FROM inhabitant ORDER BY personid';
        const result1 = await customQuery(query, 0, 5);
        expect(result1.isArray).to.be.true;
        expect(result1.rows).to.have.lengthOf(5);
        expect(result1.total).to.equal(19);

        const result2 = await customQuery(query, 5, 5);
        expect(result2.rows).to.have.lengthOf(5);
        expect(result2.rows[0]).to.not.deep.equal(result1.rows[0]);
    });

    it('handles column aliases correctly', async () => {
        const query = 'SELECT personid as id, name FROM inhabitant LIMIT 1';
        const result = await customQuery(query, 0, 10);
        expect(result.columns).to.include('id');
        expect(result.columns).to.include('name');
        expect(result.columns).to.have.lengthOf(2);
    });

});

describe('customQuery for non-SELECT operations', () => {
    const cleanup = async (itemName) => {
        const cleanupQuery = `DELETE FROM item WHERE item = '${itemName}'`;
        await customQuery(cleanupQuery, 0, 10);
    };

    beforeEach(async () => {
        await cleanup('testitem');
        await cleanup('update_test');
    });

    afterEach(async () => {
        await cleanup('testitem');
        await cleanup('update_test');
    });

    it('handles INSERT query correctly', async () => {
        const insertQuery = "INSERT INTO item (item,owner,hash) VALUES ('testitem', NULL,123456789)";
        const insertResult = await customQuery(insertQuery, 0, 10);
        expect(insertResult.isArray).to.be.false; 
        const selectQuery = "SELECT item, owner, hash FROM item WHERE item = 'testitem'";
        const selectResult = await customQuery(selectQuery, 0, 10);
        expect(selectResult.rows.length).to.equal(1);
        expect(selectResult.columns).to.not.include('hash');  
        const deleteQuery = "DELETE FROM item WHERE item = 'testitem'";
        await customQuery(deleteQuery, 0, 10);
        const verifyQuery = "SELECT item FROM item WHERE item = 'testitem'";
        const verifyResult = await customQuery(verifyQuery, 0, 10);
        expect(verifyResult.rows.length).to.equal(0);
    });

    it('handles UPDATE query correctly', async () => {
        const insertQuery = "INSERT INTO item (item, owner, hash) VALUES ('update_test', NULL, 135792468)";
        await customQuery(insertQuery, 0, 10);
        const updateQuery = "UPDATE item SET owner = 1 WHERE item = 'update_test'";
        const updateResult = await customQuery(updateQuery, 0, 10);
        expect(updateResult.isArray).to.be.false;   
        const verifyQuery = "SELECT owner FROM item WHERE item = 'update_test'";
        const verifyResult = await customQuery(verifyQuery, 0, 10);
        expect(verifyResult.rows.length).to.equal(1);
        expect(verifyResult.rows[0][0]).to.equal(1);
    });


     after(async () => {
        if (pool) await pool.end();
    });
});