// Import necessary modules for testing
const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { getUser } = require("../src/handlers/getUser");

// Initialize DynamoDB mock client
const ddbMock = mockClient(DynamoDBDocumentClient);

// Set the environment variable for the test
process.env.USERS_TABLE = "users";

describe("getUser", () => {
  beforeEach(() => {
    // Reset the mock client before each test
    ddbMock.reset();
  });

  it("should retrieve a user successfully", async () => {
    // Mock event with path parameters
    const event = {
      pathParameters: { UserID: "1" },
    };

    // Mock the GetCommand response to simulate finding the user
    ddbMock.on(GetCommand).resolves({
      Item: { UserID: "1", name: "Albert", lastname: "Einstein", email: "albert.einstein@example.com", dob: "1879-03-14" },
    });

    // Call the getUser function and store the result
    const result = await getUser(event);

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

  it("should return 404 if user not found", async () => {
    // Mock event with path parameters
    const event = {
      pathParameters: { UserID: "1" },
    };

    // Mock the GetCommand response with no item found
    ddbMock.on(GetCommand).resolves({});

    // Call the getUser function and store the result
    const result = await getUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ error: "User not found" });
  });

  it("should return server error on DynamoDB failure", async () => {
    // Mock event with path parameters
    const event = {
      pathParameters: { UserID: "1" },
    };

    // Mock the GetCommand to reject with an error
    ddbMock.on(GetCommand).rejects(new Error("DynamoDB error"));

    // Call the getUser function and store the result
    const result = await getUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: "Could not retrieve user" });
  });
});
