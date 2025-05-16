import { expect } from "chai";
import { customQuery } from "../server/models/customQueryModel.js";
import { setupTestDatabase } from "./setupTestDatabase.js";
import { databaseConnection } from "../server/services/databaseService.js";
import { databaseClose } from "../server/services/databaseService.js";

await setupTestDatabase();
databaseConnection('../../test/testDatabaseConfig.js');

describe('customQuery', () => {
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

    
    it('handles non-select queries correctly', async () => {
        const updateQuery = "UPDATE village SET chief = 1 WHERE name = 'Monkeycity'";
        const updateResult = await customQuery(updateQuery, 0, 10);
        expect(updateResult.isArray).to.be.false;
    });

    after(async function() {
        await databaseClose();
    })
});
