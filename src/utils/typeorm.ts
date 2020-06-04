import { injectable } from 'inversify';
import { EntityManager, EntitySchema, ObjectType, Repository } from 'typeorm';

import { MethodDecorator } from './types';

// Interfaces
export interface TransactionOptions {
  propagate?: boolean;
}

// Class
@injectable()
export abstract class EntityService<E> {
  // Properties
  abstract readonly entity: ObjectType<E> | EntitySchema<E>;
  abstract readonly manager: EntityManager;

  // Properties
  get repository(): Repository<E> {
    return this.manager.getRepository<E>(this.entity)
  }
}

// Handler
function proxyHandler<E, S extends EntityService<E>>(manager: EntityManager, opts: TransactionOptions = {}): ProxyHandler<S> {
  // Options
  const { propagate = false } = opts;

  return {
    get(target: S, prop: PropertyKey, receiver: unknown): unknown {
      if (prop === 'manager') {
        return manager;
      }

      const res = Reflect.get(target, prop, receiver);
      if (propagate && res instanceof EntityService) {
        return new Proxy(res, proxyHandler(manager, opts));
      }

      return res;
    }
  }
}

// Decorator
export function transaction<E, S extends EntityService<E>>(opts?: TransactionOptions): MethodDecorator<S, Function> {
  return <T extends Function>(target: S, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): void => {
    const fn = descriptor.value;

    descriptor.value = (async function(this: S, ...args: unknown[]) {
      if (!fn) return;

      return await this.manager.transaction(async manager => {
        // Define a proxy
        const proxy = new Proxy(this, proxyHandler(manager, opts));

        // Call !
        return await fn.apply(proxy, args);
      });
    }) as unknown as T;
  };
}
