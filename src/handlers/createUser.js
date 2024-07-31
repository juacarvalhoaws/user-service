// Import necessary modules from AWS SDK and other libraries
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
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

// Export the createUser function as a module
module.exports.createUser = async (event) => {
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

  // Check for existing email in the database
  const existingUser = await ddbDocClient.send(new QueryCommand({
    TableName: USERS_TABLE,
    IndexName: "EmailIndex",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": data.email,
    },
  }));

  // Return a 400 response if email already exists
  if (existingUser.Count > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email already exists" }),
    };
  }

  // Generate a unique UserID
  const UserID = uuidv4();

  // Create parameters for the PutCommand
  const params = {
    TableName: USERS_TABLE,
    Item: {
      UserID,
      ...data,
    },
  };

  try {
    // Attempt to create the new user in the database
    await ddbDocClient.send(new PutCommand(params));
    // Return a 201 response if successful
    return {
      statusCode: 201,
      body: JSON.stringify({ UserID }),
    };
  } catch (error) {
    // Return a 500 response if an error occurs
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create user" }),
    };
  }
};
