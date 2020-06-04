import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from 'app.controller';

// Load app
let app: TestingModule;

beforeAll(async () => {
  app = await Test.createTestingModule({
    controllers: [AppController],
  }).compile();
});

afterAll(async () => {
  await app.close();
});

// Tests
describe('getHello', () => {
  it('should return "Hello World!"', () => {
    const controller = app.get(AppController);

    expect(controller.getHello())
      .toBe('Hello World!');
  });
});
