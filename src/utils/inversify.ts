import { interfaces } from 'inversify';
import { fluentProvide } from 'inversify-binding-decorators';

// Decorators
export function Service(identifer: interfaces.ServiceIdentifier<any>) {
  return fluentProvide(identifer)
    .inSingletonScope()
    .done();
}
