import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { HttpError } from 'utils/errors/errors.model';

import { check } from '../check';

// Test suite
describe('utils/check', () => {
  // Constants
  const req = {} as Request;
  const res = {} as Response;

  // Test
  test('valid data', () => {
    const handler = check(validator.isNumeric);
    const next = jest.fn() as NextFunction;

    // Call handler
    handler(req, res, next, '85', 'n');

    // Check
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith();
  });

  test('invalid data', () => {
    const handler = check(validator.isNumeric);
    const next = jest.fn() as NextFunction;

    // Call handler
    handler(req, res, next, 'toto', 'n');

    // Check
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(HttpError.NotFound());
  });

  test('custom error', () => {
    const handler = check(validator.isNumeric, { error: { status: 400, message: '"n" must be a valid number' }});
    const next = jest.fn() as NextFunction;

    // Call handler
    handler(req, res, next, 'toto', 'n');

    // Check
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(HttpError.BadRequest('"n" must be a valid number'));
  });
});
