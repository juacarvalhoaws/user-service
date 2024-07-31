// Import necessary modules and mock client
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getAllUsers } = require('../src/handlers/getAllUsers');

// Initialize DynamoDB mock client
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('getAllUsers', () => {
  // Reset the mock client before each test
  beforeEach(() => {
    ddbMock.reset();
  });

  // Test case for successful retrieval of users with pagination
  it('should retrieve all users successfully with pagination', async () => {
    // Mock event with query string parameters for pagination
    const event = {
      queryStringParameters: {
        limit: '2',
        lastEvaluatedKey: JSON.stringify({ UserID: '2' }),
      },
    };

    // Mock the ScanCommand response
    ddbMock.on(ScanCommand).resolves({
      Items: [
        { UserID: '1', name: 'John', lastname: 'Doe', email: 'john.doe@example.com', dob: '1990-01-01' },
        { UserID: '2', name: 'Jane', lastname: 'Doe', email: 'jane.doe@example.com', dob: '1991-01-01' },
      ],
      LastEvaluatedKey: { UserID: '2' },
    });

    // Call the getAllUsers function and store the result
    const result = await getAllUsers(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.items).toHaveLength(2);
    expect(body.lastEvaluatedKey).toBeDefined();
  });

  // Test case for handling errors during user retrieval
  it('should handle errors while retrieving users', async () => {
    // Mock event with query string parameters
    const event = {
      queryStringParameters: {
        limit: '2',
      },
    };

    // Mock the ScanCommand to reject with an error
    ddbMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

    // Call the getAllUsers function and store the result
    const result = await getAllUsers(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: 'Could not retrieve users' });
  });
});
