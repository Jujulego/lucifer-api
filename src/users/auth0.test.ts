import { Test, TestingModule } from '@nestjs/testing';
import { ManagementClient, ObjectWithId, User } from 'auth0';

import { Auth0Module } from 'auth0.module';

import { Auth0UserService } from './auth0.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

// Load services
let app: TestingModule;
let service: Auth0UserService;

const mgmt = {
  async getUsers(): Promise<User[]> {
    return [];
  },
  async getUser(params: ObjectWithId): Promise<User> {
    return { user_id: params.id };
  }
} as ManagementClient;

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [Auth0Module],
    providers: [Auth0UserService]
  })
    .overrideProvider(ManagementClient).useValue(mgmt)
    .compile();

  service = app.get(Auth0UserService);
});

afterAll(async () => {
  await app.close();
});

// Mocks
afterEach(async () => {
  jest.restoreAllMocks();
});

// Tests suites
describe('Auth0UserService.get', () => {
  const user = {
    user_id:  'tests|users-auth0-10',
    email:    'test10@users.auth0',
    emailVerified: false,
    name:     'Test',
    nickname: 'test',
    picture:  'https://auth0.users.com/test10'
  }

  // Tests
  it('should return parsed user', async () => {
    // Mock
    const spy = jest.spyOn(mgmt, 'getUser')
      .mockImplementation(async () => user);

    // Call
    await expect(service.get(user.user_id))
      .resolves.toEqual({
        id:       user.user_id,
        email:    user.email,
        emailVerified: user.emailVerified,
        name:     user.name,
        nickname: user.nickname,
        picture:  user.picture
      });

    // Check call
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ id: user.user_id });
  });

  it('should throw if user is undefined', async () => {
    // Mock
    jest.spyOn(mgmt, 'getUser')
      .mockImplementation(async () => undefined);

    // Call
    await expect(service.get(user.user_id))
      .rejects.toEqual(new NotFoundException(`User ${user.user_id} not found`));
  });

  it('should convert auth0\'s error', async () => {
    // Mock
    jest.spyOn(mgmt, 'getUser')
      .mockImplementation(async () => { throw { statusCode: 404, message: 'Not found !' }; });

    // Call
    await expect(service.get(user.user_id))
      .rejects.toEqual(new NotFoundException('Not found !'));
  });

  it('should throw if auth0 throws', async () => {
    const error = new Error();

    // Mock
    jest.spyOn(mgmt, 'getUser')
      .mockImplementation(async () => { throw error; });

    // Call
    await expect(service.get(user.user_id))
      .rejects.toBe(error);
  });
});

describe('Auth0UserService.list', () => {
  const users = [
    {
      user_id:  'tests|users-auth0-21',
      email:    'test21@users.auth0',
      emailVerified: false,
      name:     'Test',
      nickname: 'test',
      picture:  'https://auth0.users.com/test21'
    },
    {
      user_id:  'tests|users-auth0-22',
      email:    'test22@users.auth0',
      emailVerified: false,
      name:     'Test',
      nickname: 'test',
      picture:  'https://auth0.users.com/test22'
    }
  ];

  // Tests
  it('should return parsed user list', async () => {
    // Mock
    const spy = jest.spyOn(mgmt, 'getUsers')
      .mockImplementation(async () => users);

    // Call
    await expect(service.list())
      .resolves.toEqual(
        users.map(usr => expect.objectContaining({ id: usr.user_id }))
      );

    // Check call
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ sort: 'user_id:1' });
  });

  it('should convert auth0\'s error', async () => {
    // Mock
    jest.spyOn(mgmt, 'getUsers')
      .mockImplementation(async () => { throw { statusCode: 403, message: 'Forbidden !' }; });

    // Call
    await expect(service.list())
      .rejects.toEqual(new ForbiddenException('Forbidden !'));
  });

  it('should throw if auth0 throws', async () => {
    // Mock
    const error = new Error();

    jest.spyOn(mgmt, 'getUsers')
      .mockImplementation(async () => { throw error; });

    // Call
    await expect(service.list())
      .rejects.toBe(error);
  });
});
