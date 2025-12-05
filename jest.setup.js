// jest.setup.js
const mockDynamoDBState = {
  items: new Map(),
};

// Mock DynamoDB Document Client
jest.mock('@aws-sdk/lib-dynamodb', () => {
  // Mock command classes
  class MockCommand {
    constructor(params) {
      this.input = params;
    }
  }

  class PutCommand extends MockCommand {}
  class GetCommand extends MockCommand {}
  class QueryCommand extends MockCommand {}
  class DeleteCommand extends MockCommand {}

  const mockSend = jest.fn().mockImplementation((command) => {
    const commandName = command.constructor.name;
    const { input } = command;

    switch (commandName) {
      case 'PutCommand': {
        const key = `${input.Item.ownerId}:${input.Item.id}`;
        const now = new Date().toISOString();
        const item = {
          ...input.Item,
          created: input.Item.created || now,
          updated: now,
        };
        mockDynamoDBState.items.set(key, { ...item });
        return Promise.resolve({
          Attributes: { ...item },
        });
      }
      case 'GetCommand': {
        const key = `${input.Key.ownerId}:${input.Key.id}`;
        const item = mockDynamoDBState.items.get(key);
        return item ? Promise.resolve({ Item: { ...item } }) : Promise.resolve({});
      }
      case 'QueryCommand': {
        const items = Array.from(mockDynamoDBState.items.values()).filter(
          (item) => item.ownerId === input.ExpressionAttributeValues[':ownerId']
        );

        if (input.ProjectionExpression === 'id') {
          return Promise.resolve({
            Items: items.map(({ id }) => ({ id })),
            Count: items.length,
            ScannedCount: items.length,
          });
        }
        return Promise.resolve({
          Items: [...items],
          Count: items.length,
          ScannedCount: items.length,
        });
      }
      case 'DeleteCommand': {
        const key = `${input.Key.ownerId}:${input.Key.id}`;
        const item = mockDynamoDBState.items.get(key);
        mockDynamoDBState.items.delete(key);
        return Promise.resolve({
          Attributes: item || null,
        });
      }
      default:
        return Promise.resolve({});
    }
  });

  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: mockSend,
        __mockSend: mockSend,
      })),
    },
    PutCommand,
    GetCommand,
    QueryCommand,
    DeleteCommand,
  };
});

// Mock S3 Client
jest.mock('@aws-sdk/client-s3', () => {
  const mockS3State = new Map();

  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockImplementation((command) => {
        if (command.constructor.name === 'PutObjectCommand') {
          const key = command.input.Key;
          mockS3State.set(key, command.input.Body);
          return Promise.resolve({});
        }
        if (command.constructor.name === 'GetObjectCommand') {
          const key = command.input.Key;
          const body = mockS3State.get(key);
          if (!body) {
            const error = new Error('Not found');
            error.name = 'NoSuchKey';
            throw error;
          }
          return Promise.resolve({ Body: body });
        }
        if (command.constructor.name === 'DeleteObjectCommand') {
          return Promise.resolve({});
        }
        return Promise.resolve({});
      }),
    })),
    PutObjectCommand: jest.fn().mockImplementation((params) => ({
      input: params,
      name: 'PutObjectCommand',
    })),
    GetObjectCommand: jest.fn().mockImplementation((params) => ({
      input: params,
      name: 'GetObjectCommand',
    })),
    DeleteObjectCommand: jest.fn().mockImplementation((params) => ({
      input: params,
      name: 'DeleteObjectCommand',
    })),
  };
});

// Mock http-auth
jest.mock('http-auth', () => {
  return {
    basic: jest.fn().mockImplementation(() => ({
      users: {
        'user1@email.com': 'password1',
        'test@example.com': 'password123',
      },
      check: jest.fn((username, password, callback) => {
        const users = {
          'user1@email.com': 'password1',
          'test@example.com': 'password123',
        };
        callback(users[username] === password);
      }),
    })),
  };
});

// Mock http-auth-passport
jest.mock('http-auth-passport', () => {
  return jest.fn().mockImplementation(() => {
    return (username, password, done) => {
      const users = {
        'user1@email.com': 'password1',
        'test@example.com': 'password123',
      };
      if (users[username] === password) {
        return done(null, { email: username });
      }
      return done(null, false);
    };
  });
});

// Reset mocks before each test
beforeEach(() => {
  // Clear DynamoDB state
  mockDynamoDBState.items.clear();
  // Clear all mocks
  jest.clearAllMocks();
});
