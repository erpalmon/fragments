const mockSend = jest.fn();

// Mock for DynamoDBClient
const DynamoDBClient = jest.fn(() => ({
  config: {},
  send: mockSend,
}));

// Command classes
class Command {
  constructor(params) {
    this.params = params;
  }
}

class PutCommand extends Command {}
class GetCommand extends Command {}
class QueryCommand extends Command {}
class DeleteCommand extends Command {}

// Default mock implementation
mockSend.mockImplementation((command) => {
  const commandName = command.constructor.name;
  
  switch (commandName) {
    case 'GetCommand':
      return Promise.resolve({ 
        Item: null, // Default to null, can be overridden in tests
      });
    case 'PutCommand':
      return Promise.resolve({
        Attributes: command.params.Item,
      });
    case 'QueryCommand':
      return Promise.resolve({
        Items: [], // Default to empty array, can be overridden in tests
      });
    case 'DeleteCommand':
      return Promise.resolve({
        Attributes: { id: command.params.Key.id, ownerId: command.params.Key.ownerId },
      });
    default:
      return Promise.resolve({});
  }
});

// Export everything
module.exports = {
  DynamoDBClient,
  DynamoDBDocumentClient: {
    from: jest.fn((_client) => ({
      send: mockSend,
    })),
  },
  DynamoDBDocument: {
    from: jest.fn((_client) => ({
      send: mockSend,
      put: jest.fn().mockImplementation((params) => mockSend(new PutCommand({ ...params, Item: params.Item || {} }))),
      get: jest.fn().mockImplementation((params) => mockSend(new GetCommand(params))),
      query: jest.fn().mockImplementation((params) => mockSend(new QueryCommand(params))),
      delete: jest.fn().mockImplementation((params) => mockSend(new DeleteCommand(params))),
    })),
  },
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  mockSend,
};
