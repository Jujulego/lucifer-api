import { Container } from 'inversify';

import { servicesModule } from 'utils';

// Container
export const DIContainer = new Container();

// Utils
export function loadServices() {
  DIContainer.load(servicesModule());
}
