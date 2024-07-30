const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;

const userSchema = Joi.object({
  name: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  dob: Joi.date().iso().required(),
});

module.exports.createUser = async (event) => {
  const data = JSON.parse(event.body);
  const { error } = userSchema.validate(data);
  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.details[0].message }),
    };
  }

   // Check for existing email
   const existingUser = await ddbDocClient.send(new QueryCommand({
    TableName: USERS_TABLE,
    IndexName: "EmailIndex",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": data.email,
    },
  }));

  if (existingUser.Count > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email already exists" }),
    };
  } 

  const UserID = uuidv4();
  const params = {
    TableName: USERS_TABLE,
    Item: {
      UserID,
      ...data,
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ UserID }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create user" }),
    };
  }
};

module.exports.getUser = async (event) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      UserID: event.pathParameters.UserID,
    },
  };

  try {
    const result = await ddbDocClient.send(new GetCommand(params));
    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve user" }),
    };
  }
};

module.exports.updateUser = async (event) => {
  const data = JSON.parse(event.body);
  const { error } = userSchema.validate(data);
  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.details[0].message }),
    };
  }

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

  try {
    const result = await ddbDocClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update user" }),
    };
  }
};

module.exports.deleteUser = async (event) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      UserID: event.pathParameters.UserID,
    },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
    return {
      statusCode: 204,
      body: JSON.stringify({}),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete user" }),
    };
  }
};
