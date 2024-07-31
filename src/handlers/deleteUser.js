// Import necessary modules from AWS SDK
const { GetCommand, DeleteCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const Joi = require("joi");

// Ensure the USERS_TABLE environment variable is set
const USERS_TABLE = process.env.USERS_TABLE;

// Initialize the DynamoDB Document Client
const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Export the deleteUser function as a module
module.exports.deleteUser = async (event) => {
  // Extract the UserID from the path parameters
  const userId = event.pathParameters.UserID;

  // Define the parameters for the GetCommand to check if the user exists
  const getParams = {
    TableName: USERS_TABLE,
    Key: {
      UserID: userId,
    },
  };

  // Define the parameters for the DeleteCommand to delete the user
  const deleteParams = {
    TableName: USERS_TABLE,
    Key: {
      UserID: userId,
    },
  };

  try {
    // Check if the user exists by sending a GetCommand to DynamoDB
    const getResult = await ddbDocClient.send(new GetCommand(getParams));
    if (!getResult.Item) {
      // Return a 404 response if the user does not exist
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Delete the user by sending a DeleteCommand to DynamoDB
    await ddbDocClient.send(new DeleteCommand(deleteParams));
    // Return a 204 response if successful
    return {
      statusCode: 204,
      body: JSON.stringify({}),
    };
  } catch (error) {
    // Return a 500 response if an error occurs
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete user" }),
    };
  }
};
