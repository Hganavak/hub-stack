const { createTestClient } = require('apollo-server-testing');
const { createServer } = require('../index')
const TQ = require('./test-queries'); // Collection of test queries
const { gql, introspectSchema } = require('apollo-server');
const { JsonWebTokenError } = require('jsonwebtoken');

/**
 * This function creates both the ApolloServer and test client
 * used to make queries against it.
 */
async function createServerAndTestClient() {
    let server = await createServer();
    return createTestClient(server);
}

/**
 * Before any of the tests run create the query function and make
 * it available within all tests.
 */
beforeAll(async () => {
    return { query } = await createServerAndTestClient();
});

describe('Basic queries', () => {
    test('Querying the articleCollection returns the correct fields', async function () {

        let res = await query({ query: TQ.GET_ARTICLE_COLLECTION });

        // Get the fields returned from the first item
        let returned_fields = Object.keys(res.data.articleCollection.items[0]);
        expect(returned_fields).toEqual(TQ.SEARCHABLE_FIELDS)
    })
})