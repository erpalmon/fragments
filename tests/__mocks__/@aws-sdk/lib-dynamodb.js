class PutCommand {
  constructor(params) {
    this.params = params;
    this.input = params;
  }
}

class GetCommand {
  constructor(params) {
    this.params = params;
    this.input = params;
  }
}

class QueryCommand {
  constructor(params) {
    this.params = params;
    this.input = params;
  }
}

class DeleteCommand {
  constructor(params) {
    this.params = params;
    this.input = params;
  }
}

module.exports = {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  DynamoDBDocument: {
    from: jest.fn(client => client)
  }
};
