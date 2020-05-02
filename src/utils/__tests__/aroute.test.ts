import { Request, Response, NextFunction, RequestHandler } from 'express';

import { aroute } from '../aroute';

// Test suite
describe('utils/aroute', () => {
  // Constants
  const req = {} as Request;
  const res = {} as Response;

  // Tests
  test('responding handler', async () => {
    const next = jest.fn() as NextFunction;
    const handler = jest.fn() as RequestHandler;

    // Test
    await aroute(handler)(req, res, next);

    // Checks
    expect(next).not.toBeCalled();
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(req, res, next);
  });

  test('throwing handler', async () => {
    const err = new Error();
    const next = jest.fn() as NextFunction;
    const handler = jest.fn(() => { throw err; }) as RequestHandler;

    // Test
    await aroute(handler)(req, res, next);

    // Checks
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(err);
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(req, res, next);
  });
});
