import { Container } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';

// Container
const DIContainer = new Container();

// Utils
export function loadServices() {
  DIContainer.load(buildProviderModule())
}

export default DIContainer;
