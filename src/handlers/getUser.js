// Import necessary modules from AWS SDK
const { GetCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const Joi = require("joi");

// Ensure the USERS_TABLE environment variable is set
const USERS_TABLE = process.env.USERS_TABLE;

// Initialize the DynamoDB Document Client
const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Export the getUser function as a module
module.exports.getUser = async (event) => {
  // Define the parameters for the GetCommand to retrieve the user by UserID
  const params = {
    TableName: USERS_TABLE,
    Key: {
      UserID: event.pathParameters.UserID,
    },
  };

  try {
    // Send the GetCommand to DynamoDB
    const result = await ddbDocClient.send(new GetCommand(params));
    
    // Check if the user was found in the DynamoDB table
    if (result.Item) {
      // Return a 200 response with the user data if found
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    } else {
      // Return a 404 response if the user is not found
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }
  } catch (error) {
    // Return a 500 response if an error occurs while retrieving the user
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve user" }),
    };
  }
};
