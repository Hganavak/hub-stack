'use strict';

const sendElasticsearchRequest = require('./elasticsearch-client');

module.exports.search = async (event, context) => {
  let queryString = JSON.parse(event.body).query;
  console.log(`Received query string: ${queryString}`); 

  let query = { // The query object to be sent to ElasticSearch
    _source: {
      includes: [
        "fields.slug",
        "fields.title",
        "fields.summary",
        "fields.ssoProtected",
        "fields.searchable",
        "fields.keywords",
        "sys.contentType"
      ]
    },
    query: { 
      bool: {
        must: [
          {
            simple_query_string: {
              query: `${queryString}~2`
            }
          },
          {
            term: {
              "fields.searchable.en-US": true
            }
          }
        ]
      }
    }
  };    // possibly the fuzziness should be AUTO rather than a defined number (~2)

  const params = {
    httpMethod: 'POST',
    requestPath: 'main-index/_search',
    payload: query
  };

  const result = await sendElasticsearchRequest(params);

  if (result.statusCode == 200) {
    console.log("Request status: " + result.statusCode + " " + result.statusMessage);   
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Welcome to hub-search-proxy",
        your_request: event.body,
        result: result.body // .hits.hits ?
      }),
    };
  } else {
    context.fail('Search failed. ' + JSON.stringify(result));
  }
}

module.exports.indexDoc = async (event, context) => {
  let doc = JSON.parse(event.body);
  console.log('Received doc to index');

  const params = {
    httpMethod: 'PUT',
    requestPath: `main-index/_doc/${doc.sys.id}`,
    payload: doc
  };

  const result = await sendElasticsearchRequest(params);

  if (result.statusCode == 200 || result.statusCode == 201) {
    console.log("Request status: " + result.statusCode + " " + result.statusMessage);   
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        result: result.body
      }),
    };
  } else {
    context.fail('Error. ' + JSON.stringify(result) + ' . Payload: ' + JSON.stringify(doc));
  }
}