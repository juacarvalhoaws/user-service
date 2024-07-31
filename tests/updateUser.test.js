// Import necessary modules for testing
const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { updateUser } = require("../src/handlers/updateUser");

// Initialize DynamoDB mock client
const ddbMock = mockClient(DynamoDBDocumentClient);

// Set the environment variable for the test
process.env.USERS_TABLE = "users";

describe("updateUser", () => {
  beforeEach(() => {
    // Reset the mock client before each test
    ddbMock.reset();
  });

  it("should update a user successfully", async () => {
    // Mock event with path parameters and body
    const event = {
      pathParameters: { UserID: "1" },
      body: JSON.stringify({
        name: "Albert",
        lastname: "Einstein",
        email: "albert.einstein@example.com",
        dob: "1879-03-14",
      }),
    };

    // Mock the UpdateCommand response to simulate a successful update
    ddbMock.on(UpdateCommand).resolves({
      Attributes: {
        UserID: "1",
        name: "Albert",
        lastname: "Einstein",
        email: "albert.einstein@example.com",
        dob: "1879-03-14",
      },
    });

    // Call the updateUser function and store the result
    const result = await updateUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      UserID: "1",
      name: "Albert",
      lastname: "Einstein",
      email: "albert.einstein@example.com",
      dob: "1879-03-14",
    });
  });

  it("should return validation error for missing fields", async () => {
    // Mock event with path parameters and incomplete body
    const event = {
      pathParameters: { UserID: "1" },
      body: JSON.stringify({
        name: "Albert",
        email: "albert.einstein@example.com",
        dob: "1879-03-14",
      }),
    };

    // Call the updateUser function and store the result
    const result = await updateUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty("error");
  });

  it("should return server error on DynamoDB failure", async () => {
    // Mock event with path parameters and body
    const event = {
      pathParameters: { UserID: "1" },
      body: JSON.stringify({
        name: "Albert",
        lastname: "Einstein",
        email: "albert.einstein@example.com",
        dob: "1879-03-14",
      }),
    };

    // Mock the UpdateCommand to reject with an error
    ddbMock.on(UpdateCommand).rejects(new Error("DynamoDB error"));

    // Call the updateUser function and store the result
    const result = await updateUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: "Could not update user" });
  });
});
