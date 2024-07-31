// Import necessary modules from AWS SDK and other libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const Joi = require("joi");

// Initialize the DynamoDB client and document client
const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Table name from environment variables
const USERS_TABLE = process.env.USERS_TABLE;

// Define the schema for user validation using Joi
const userSchema = Joi.object({
  name: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  dob: Joi.date().iso().required(),
});

// Export the updateUser function as a module
module.exports.updateUser = async (event) => {
  try {
    // Parse the incoming request body
    const data = JSON.parse(event.body);

    // Validate the incoming data against the user schema
    const { error } = userSchema.validate(data);
    if (error) {
      // Return a 400 response if validation fails
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.details[0].message }),
      };
    }

    // Define the parameters for the UpdateCommand
    const params = {
      TableName: USERS_TABLE,
      Key: {
        UserID: event.pathParameters.UserID,
      },
      UpdateExpression: "set #name = :name, lastname = :lastname, email = :email, dob = :dob",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":lastname": data.lastname,
        ":email": data.email,
        ":dob": data.dob,
      },
      ReturnValues: "ALL_NEW",
    };

    // Send the UpdateCommand to DynamoDB
    const result = await ddbDocClient.send(new UpdateCommand(params));

    // Return a 200 response with the updated user data if successful
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    // Return a 500 response if an error occurs while updating the user
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update user" }),
    };
  }
};
