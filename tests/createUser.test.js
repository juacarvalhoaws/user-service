// Import necessary modules and mock client
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { createUser } = require('../src/handlers/createUser');

// Initialize DynamoDB mock client
const ddbMock = mockClient(DynamoDBDocumentClient);

// Mock the uuid module to ensure consistent UserID values during tests
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('createUser', () => {
  // Reset the mock client and mock uuid before each test
  beforeEach(() => {
    ddbMock.reset();
    uuidv4.mockReturnValue('unique-id');
  });

  // Test case for successfully creating a user
  it('should create a user successfully', async () => {
    // Mock event with body containing user data
    const event = {
      body: JSON.stringify({
        name: 'Albert',
        lastname: 'Einstein',
        email: 'albert.einstein@homethrive.com',
        dob: '1879-03-14',
      }),
    };

    // Mock the QueryCommand response to simulate no existing user with the same email
    ddbMock.on(QueryCommand).resolves({ Count: 0 });

    // Mock the PutCommand response to simulate successful user creation
    ddbMock.on(PutCommand).resolves({});

    // Call the createUser function and store the result
    const result = await createUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ UserID: 'unique-id' });
  });

  // Test case for handling validation errors
  it('should return validation error for missing fields', async () => {
    // Mock event with body missing required fields
    const event = {
      body: JSON.stringify({
        name: 'Albert',
        email: 'albert.einstein@homethrive.com',
        dob: '1879-03-14',
      }),
    };

    // Call the createUser function and store the result
    const result = await createUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  // Test case for handling existing email error
  it('should return error if email already exists', async () => {
    // Mock event with body containing user data
    const event = {
      body: JSON.stringify({
        name: 'Albert',
        lastname: 'Einstein',
        email: 'albert.einstein@homethrive.com',
        dob: '1879-03-14',
      }),
    };

    // Mock the QueryCommand response to simulate existing user with the same email
    ddbMock.on(QueryCommand).resolves({ Count: 1 });

    // Call the createUser function and store the result
    const result = await createUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'Email already exists' });
  });

  // Test case for handling DynamoDB errors
  it('should return server error on DynamoDB failure', async () => {
    // Mock event with body containing user data
    const event = {
      body: JSON.stringify({
        name: 'Albert',
        lastname: 'Einstein',
        email: 'albert.einstein@homethrive.com',
        dob: '1879-03-14',
      }),
    };

    // Mock the QueryCommand response to simulate no existing user with the same email
    ddbMock.on(QueryCommand).resolves({ Count: 0 });

    // Mock the PutCommand to reject with an error
    ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));

    // Call the createUser function and store the result
    const result = await createUser(event);

    // Assert the status code and response body
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: 'Could not create user' });
  });
});
