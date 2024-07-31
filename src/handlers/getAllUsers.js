// Import necessary modules from AWS SDK and other libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const Joi = require("joi");

// Initialize the DynamoDB client and document client
const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Table name from environment variables
const USERS_TABLE = process.env.USERS_TABLE;

// Export the getAllUsers function as a module
module.exports.getAllUsers = async (event) => {
  // Parse query string parameters for limit and lastEvaluatedKey
  const limit = event.queryStringParameters ? parseInt(event.queryStringParameters.limit, 10) : 10;
  const lastEvaluatedKey = event.queryStringParameters && event.queryStringParameters.lastEvaluatedKey 
    ? JSON.parse(event.queryStringParameters.lastEvaluatedKey) 
    : undefined;

  // Define the parameters for the ScanCommand
  const params = {
    TableName: USERS_TABLE,
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  try {
    // Scan the DynamoDB table for users
    const result = await ddbDocClient.send(new ScanCommand(params));
    // Return a 200 response with the scanned items and the last evaluated key for pagination
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
      }),
    };
  } catch (error) {
    // Return a 500 response if an error occurs
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve users" }),
    };
  }
};
