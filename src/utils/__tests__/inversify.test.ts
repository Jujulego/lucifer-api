import { Container } from 'inversify';

import { Service, servicesModule } from '../inversify';

// Test classes
@Service()
class TestService {}

@Service({ singleton: true })
class TestSingletonService {}

// Test suite
describe('utils.inversify', () => {
  // Setup container
  const container = new Container();

  beforeAll(() => {
    container.load(servicesModule());
  });

  beforeEach(() => {
    container.snapshot();
  });

  afterEach(() => {
    container.restore();
  });

  // Tests
  test('service is bound', () => {
    expect(container.isBound(TestService))
      .toBeTruthy();

    expect(container.isBound(TestSingletonService))
      .toBeTruthy();
  });

  test('get service', () => {
    expect(container.get(TestService))
      .toBeInstanceOf(TestService);
  });

  test('get singleton service', () => {
    const s1 = container.get(TestSingletonService);
    const s2 = container.get(TestSingletonService);

    expect(s1).toBeInstanceOf(TestSingletonService);
    expect(s2).toBeInstanceOf(TestSingletonService);

    expect(s1).toBe(s2);
  });
});
