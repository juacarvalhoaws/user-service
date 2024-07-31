// Import necessary modules for testing
const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { deleteUser } = require("../src/handlers/deleteUser");

// Initialize DynamoDB mock client
const ddbMock = mockClient(DynamoDBDocumentClient);

// Set the environment variable for the test
process.env.USERS_TABLE = "users";

describe("deleteUser", () => {
  beforeEach(() => {
    // Reset the mock client before each test
    ddbMock.reset();
  });

  it("should delete a user successfully", async () => {
    // Mock event with path parameters
    const event = {
      pathParameters: { UserID: "1" },
    };

    // Mock the GetCommand response to simulate finding the user
    ddbMock.on(GetCommand).resolves({
      Item: { UserID: "1", name: "Albert", lastname: "Einstein", email: "albert.einstein@example.com", dob: "1879-03-14" },
    });

    // Mock the DeleteCommand response to simulate successful deletion
    ddbMock.on(DeleteCommand).resolves({});

    // Call the deleteUser function and store the result
    const result = await deleteUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(204);
    expect(result.body).toEqual("{}");
  });

  it("should return 404 if user not found", async () => {
    // Mock event with path parameters
    const event = {
      pathParameters: { UserID: "1" },
    };

    // Mock the GetCommand response with no item found
    ddbMock.on(GetCommand).resolves({});

    // Call the deleteUser function and store the result
    const result = await deleteUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toHaveProperty("error", "User not found");
  });

  it("should return server error on DynamoDB failure", async () => {
    // Mock event with path parameters
    const event = {
      pathParameters: { UserID: "1" },
    };

    // Mock the GetCommand to reject with an error
    ddbMock.on(GetCommand).rejects(new Error("DynamoDB error"));

    // Call the deleteUser function and store the result
    const result = await deleteUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: "Could not delete user" });
  });
});
