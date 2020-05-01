import 'reflect-metadata';
import { ContainerModule, interfaces, decorate, injectable } from 'inversify';

import { Newable } from './types';

// Types
export interface ServiceOpts {
  singleton?: boolean
}

type BindCallback = (bind: interfaces.Bind) => void;

// Constants
const METADATA_KEY = Symbol('utils.inversify:bind');
const services: Newable<any>[] = [];

// Decorator factory
export function Service(opts: ServiceOpts = {}) {
  // Options
  const { singleton = false } = opts;

  // Decorator
  return (target: Newable<any>) => {
    decorate(injectable(), target);

    // Prepare binding
    const cb = (bind: interfaces.Bind) => {
      const binding = bind(target).to(target);

      if (singleton) binding.inSingletonScope();
    }

    Reflect.defineMetadata(METADATA_KEY, cb, target);
    services.push(target);

    return target;
  }
}

// Utils
export function servicesModule(): ContainerModule {
  return new ContainerModule((bind, unbind, isBound) => {
    // Bind every services
    services.forEach(service => {
      if (!isBound(service)) {
        const cb = Reflect.getMetadata(METADATA_KEY, service) as BindCallback;
        cb(bind);
      }
    });
  });
}
