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
        const result = await customQuery(query);
        expect(result.isArray).to.be.true;
        expect(result.total).to.equal(3);
        expect(result.columns).to.include('villageid');
        expect(result.columns).to.include('name');
        expect(result.columns).to.not.include('hash');
        expect(result.rows[1]).to.deep.equal([2, 'Cucumbertown', 6]);
    });

    it('handles empty SELECT results correctly', async () => {
        const query = 'SELECT * FROM village WHERE villageid = 999';
        const result = await customQuery(query);
        expect(result.isArray).to.be.true;
        expect(result.total).to.equal(0);
        expect(result.columns).to.be.an('array').that.is.empty;
        expect(result.rows).to.be.an('array').that.is.empty;
    });

    it('filters hash columns from multiple tables in a JOIN', async () => {
        const query = 'SELECT * FROM village v JOIN inhabitant i ON v.villageid = i.villageid';
        const result = await customQuery(query);
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
        const result = await customQuery(query);
        expect(result.columns).to.include('id');
        expect(result.columns).to.include('name');
        expect(result.columns).to.have.lengthOf(2);
    });

    it('handles queries with unicode characters correctly', async () => {
        const query = "SELECT owner FROM item WHERE item LIKE '咖啡%'";
        const result = await customQuery(query);
        console.log(result);
        expect(result.rows[0][0]).to.equal(3);
    });

    it('handles non-select statements correctly', async () => {
        const updateQuery = "UPDATE village SET chief = 1 WHERE name = 'Monkeycity'";
        const updateResult = await customQuery(updateQuery);
        expect(updateResult.isArray).to.be.false;
    });

    it('throws an error for empty queries', async () => {
        const query = '';
        try {
            await customQuery(query);
            expect.fail('Expected error not thrown');
        } catch (error) {
            expect(error.message).to.equal('Query cannot be empty');
        }
    });
    
    it('throws an error for falsy values', async () => {
        [undefined, null, false, 0].forEach(async (falsyValue) => {
            const query = falsyValue;
            try {
                await customQuery(query);
                expect.fail('Expected error not thrown');
            } catch (error) {
                expect(error.message).to.equal('Query cannot be empty');
            }
        });
    });
    
    // Wrong behavior:
    it('does NOT handle multi-select queries correctly', async () => {
        // TODO: execute all statements, returning the last one if it is a SELECT
        const query = 'SELECT * FROM village; SELECT * FROM inhabitant';
        try {
            await customQuery(query);
            expect.fail('Expected error not thrown');
        }
        catch (error) {
            expect(error.message).to.include('SQL error');
        }
    });

    it('throws an error for invalid queries', async () => {
        try {
            await customQuery('INVALID SQL QUERY');
            expect.fail('Expected error not thrown');
        } catch (error) {
            expect(error.message).to.include('SQL error');
        }
    });

    after(async function() {
        await databaseClose();
    })
});
