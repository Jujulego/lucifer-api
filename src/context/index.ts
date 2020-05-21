import { Request } from 'express';

import { Context } from './context.model';
import { ExpressContext } from './express.context';
import { TestContext, TestRequest } from './test.context';

// Exports
export { Context } from './context.model';

// Types
type ContextType = 'express' | 'test';

// Utils
export function buildContext(type: 'test', request: TestRequest): TestContext;
export function buildContext(type: 'express', request: Request): ExpressContext;
export function buildContext(type: ContextType, request: any): Context {
  switch (type) {
    case 'express':
      return new ExpressContext(request);

    case 'test':
      return new TestContext(request);
  }
}
