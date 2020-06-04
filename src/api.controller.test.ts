import { Test, TestingModule } from '@nestjs/testing';

import { ApiController } from 'api.controller';
import { Controller } from '@nestjs/common';

// Load app
let app: TestingModule;
let controller: ApiController;

beforeAll(async () => {
  app = await Test.createTestingModule({
    controllers: [ApiController],
  }).compile();

  controller = app.get(Controller);
});

afterAll(async () => {
  await app.close();
});

// Tests
describe('getHello', () => {
  it('should return version data', async () => {
    await expect(controller.getVersion())
      .resolves.toEqual({
        version: expect.any(String),
        commit: expect.any(String)
      });
  });
});
