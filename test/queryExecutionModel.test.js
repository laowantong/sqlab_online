import { expect } from "chai";
import { executeQuery } from "../server/models/queryExecutionModel.js";
import { setupTestDatabase } from "./setupTestDatabase.js";
import { databaseConnection } from "../server/services/databaseService.js";
import { databaseClose } from "../server/services/databaseService.js";
import { expectThrowsAsync } from "./testUtils.js";

await setupTestDatabase();
databaseConnection('../../test/testDatabaseConfig.js');

describe('executeQuery', () => {
    it('handles simple SELECT query correctly', async () => {
        const query = 'SELECT * FROM village';
        const result = await executeQuery(query);
        expect(result.isArray).to.be.true;
        expect(result.total).to.equal(3);
        expect(result.columns).to.include('villageid');
        expect(result.columns).to.include('name');
        expect(result.columns).to.not.include('hash');
        expect(result.rows[1]).to.deep.equal([2, 'Cucumbertown', 6]);
    });

    it('handles empty SELECT results correctly', async () => {
        const query = 'SELECT * FROM village WHERE villageid = 999';
        const result = await executeQuery(query);
        expect(result.isArray).to.be.true;
        expect(result.total).to.equal(0);
        expect(result.columns).to.be.an('array').that.is.empty;
        expect(result.rows).to.be.an('array').that.is.empty;
    });

    it('filters hash columns from multiple tables in a JOIN', async () => {
        const query = 'SELECT * FROM village v JOIN inhabitant i ON v.villageid = i.villageid';
        const result = await executeQuery(query);
        expect(result.isArray).to.be.true;
        expect(result.columns).to.not.include('hash');
        expect(result.columns).to.not.include('v.hash');
        expect(result.columns).to.not.include('i.hash');
    });

    it('handles pagination correctly', async () => {
        const query = 'SELECT * FROM inhabitant ORDER BY personid';
        const result1 = await executeQuery(query, 0, 5);
        expect(result1.isArray).to.be.true;
        expect(result1.rows).to.have.lengthOf(5);
        expect(result1.total).to.equal(19);

        const result2 = await executeQuery(query, 5, 5);
        expect(result2.rows).to.have.lengthOf(5);
        expect(result2.rows[0]).to.not.deep.equal(result1.rows[0]);
    });

    it('handles column aliases correctly', async () => {
        const query = 'SELECT personid as id, name FROM inhabitant LIMIT 1';
        const result = await executeQuery(query);
        expect(result.columns).to.include('id');
        expect(result.columns).to.include('name');
        expect(result.columns).to.have.lengthOf(2);
    });

    it('handles queries with duplicate column names correctly', async () => {
        const query = 'SELECT * FROM village JOIN inhabitant USING (villageid)';
        const result = await executeQuery(query);
        const expected = [ 'villageid', 'village.name', 'chief', 'personid', 'inhabitant.name', 'gender', 'job', 'gold', 'state' ]
        expect(result.columns).to.deep.equal(expected);
    });

    it('handles queries with deduplicated column names correctly', async () => {
        const query = 'SELECT A.personid AS "id 1", B.personid AS "id 2" FROM inhabitant A JOIN inhabitant B ON A.villageid = B.villageid WHERE A.personid < B.personid';
        const result = await executeQuery(query);
        const expected = ['id 1', 'id 2'];
        expect(result.columns).to.deep.equal(expected);
    });

    it('handles queries with unicode characters correctly', async () => {
        const query = "SELECT owner FROM item WHERE item LIKE '咖啡%'";
        const result = await executeQuery(query);
        expect(result.rows[0][0]).to.equal(3);
    });

    it('handles non-select statements correctly', async () => {
        const updateQuery = "UPDATE village SET chief = 1 WHERE name = 'Monkeycity'";
        const updateResult = await executeQuery(updateQuery);
        expect(updateResult.isArray).to.be.false;
    });

    it('throws an error for empty queries', async () => {
        const query = '';
        await expectThrowsAsync(() => executeQuery(query)), 'Query cannot be empty';
    });
    
    it('throws an error for falsy values', async () => {
        for (const falsyValue of [undefined, null, false, 0]) {
            await expectThrowsAsync(() => executeQuery(falsyValue)), 'Query cannot be empty';
        }
    });
    
    // Wrong behavior:
    it('does NOT handle multi-select queries correctly', async () => {
        // TODO: execute all statements, returning the last one if it is a SELECT
        const query = 'SELECT * FROM village; SELECT * FROM inhabitant';
        await expectThrowsAsync(() => executeQuery(query)), /SQL error/;
    });
    
    it('throws an error for invalid queries', async () => {
        await expectThrowsAsync(() => executeQuery('INVALID')), /SQL error/;
    });

    after(async function() {
        await databaseClose();
    })
});
