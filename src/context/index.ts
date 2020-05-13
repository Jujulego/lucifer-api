import express from 'express';

import { Context } from 'context/context.model';
import { ExpressContext } from 'context/express.context';

// Exports
export { Context } from './context.model';

// Types
type ContextTypes = {
  'express': express.Request
};

// Utils
export function buildContext<K extends keyof ContextTypes>(type: K, request: ContextTypes[K]): Context<ContextTypes[K]> {
  switch (type) {
    case 'express':
      return new ExpressContext(request);
  }

  throw Error(`Unknown type : ${type}`);
}
