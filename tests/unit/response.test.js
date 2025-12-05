// tests/unit/response.test.js
import { jest } from '@jest/globals';
import { createErrorResponse, createSuccessResponse } from '../../src/response.js';

describe('API Responses', () => {
  test('createErrorResponse() returns correct error format', () => {
    const errorResponse = createErrorResponse(404, 'not found');
    expect(errorResponse).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });

  test('createSuccessResponse() without arguments returns minimal success response', () => {
    const successResponse = createSuccessResponse();
    expect(successResponse).toEqual({
      status: 'ok',
    });
  });

  test('createSuccessResponse() with data merges data into response', () => {
    const data = { a: 1, b: 2 };
    const successResponse = createSuccessResponse(data);
    expect(successResponse).toEqual({
      status: 'ok',
      ...data,
    });
  });

  test('createErrorResponse() with additional error details includes them in response', () => {
    const errorResponse = createErrorResponse(400, 'bad request', { field: 'email' });
    expect(errorResponse).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: 'bad request',
        field: 'email',
      },
    });
  });

  test('createSuccessResponse() with nested objects preserves structure', () => {
    const data = { 
      user: { 
        id: 1, 
        name: 'Test' 
      } 
    };
    const successResponse = createSuccessResponse(data);
    expect(successResponse).toEqual({
      status: 'ok',
      user: {
        id: 1,
        name: 'Test'
      }
    });
  });
});
