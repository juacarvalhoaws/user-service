const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { createUser, getUser, updateUser, deleteUser } = require('../handler');

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockUser = {
  UserID: '1',
  name: 'Albert',
  lastname: 'Einstein',
  email: 'albert.einstein@homethrive.com',
  dob: '1879-03-14'
};

describe('CRUD operations', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  const validEventTemplate = {
    body: JSON.stringify({
      name: 'Albert',
      lastname: 'Einstein',
      email: 'albert.einstein@homethrive.com',
      dob: '1879-03-14'
    }),
    pathParameters: { UserID: '1' }
  };

  const invalidEventTemplate = {
    body: JSON.stringify({
      name: 'Albert',
      email: 'albert.einstein@homethrive.com',
      dob: '1879-03-14'
    }),
    pathParameters: { UserID: '1' }
  };

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      ddbMock.on(PutCommand).resolves({});
      const result = await createUser(validEventTemplate);
      expect(result.statusCode).toBe(201);
      expect(JSON.parse(result.body)).toHaveProperty('UserID');
    });

    it('should return validation error for missing fields', async () => {
      const result = await createUser(invalidEventTemplate);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toHaveProperty('error');
    });

    it('should return server error on DynamoDB failure', async () => {
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));
      const result = await createUser(validEventTemplate);
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toHaveProperty('error');
    });
  });

  describe('getUser', () => {
    it('should retrieve a user successfully', async () => {
      ddbMock.on(GetCommand).resolves({ Item: mockUser });
      const result = await getUser({ pathParameters: { UserID: '1' } });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockUser);
    });

    it('should return user not found error', async () => {
      ddbMock.on(GetCommand).resolves({});
      const result = await getUser({ pathParameters: { UserID: '2' } });
      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toHaveProperty('error');
    });

    it('should return server error on DynamoDB failure', async () => {
      ddbMock.on(GetCommand).rejects(new Error('DynamoDB error'));
      const result = await getUser({ pathParameters: { UserID: '1' } });
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toHaveProperty('error');
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      ddbMock.on(UpdateCommand).resolves({ Attributes: mockUser });
      const result = await updateUser(validEventTemplate);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockUser);
    });

    it('should return validation error for missing fields', async () => {
      const result = await updateUser(invalidEventTemplate);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toHaveProperty('error');
    });

    it('should return server error on DynamoDB failure', async () => {
      ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB error'));
      const result = await updateUser(validEventTemplate);
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toHaveProperty('error');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      ddbMock.on(DeleteCommand).resolves({});
      const result = await deleteUser({ pathParameters: { UserID: '1' } });
      expect(result.statusCode).toBe(204);
    });

    it('should return server error on DynamoDB failure', async () => {
      ddbMock.on(DeleteCommand).rejects(new Error('DynamoDB error'));
      const result = await deleteUser({ pathParameters: { UserID: '1' } });
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toHaveProperty('error');
    });
  });
});
