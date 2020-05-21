import validator from 'validator';

import { buildContext } from 'context';
import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';

import { User } from './user.entity';
import { Token } from './token.entity';
import { TokenService } from './token.service';

// Tests
describe('users/token.service', () => {
  // Load services
  let database: DatabaseService;
  let service: TokenService;

  beforeAll(async () => {
    // Load services
    loadServices();

    database = DIContainer.get(DatabaseService);
    service = DIContainer.get(TokenService);

    // Connect to database
    await database.connect();
  });

  afterAll(async () => {
    // Disconnect from database
    await database.disconnect();
  });

  // Fill database
  let user: User;
  let token: Token;

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);
      const tknRepo = manager.getRepository(Token);

      // Create a user
      user = await usrRepo.save(
        usrRepo.create({ email: 'test@token.com', password: 'test' })
      );

      // Create a token
      token = await tknRepo.save(
        tknRepo.create({ user, ip: '1.2.3.4', tags: ['test'] })
      );
    });
  });

  afterEach(async () => {
    const usrRepo = database.connection.getRepository(User);
    await usrRepo.delete(user.id);
  });

  // Tests
  // - Token.lrn
  test('Token.lrn', () => {
    expect(token.lrn.id).toEqual(token.id);
    expect(token.lrn.resource).toEqual('token');

    expect(token.lrn.parent).toBeDefined();
    expect(token.lrn.parent!.id).toEqual(user.id);
    expect(token.lrn.parent!.resource).toEqual('user');
  });

  // - Token.toJSON
  test('Token.toJSON', () => {
    expect(token.toJSON())
      .toEqual({
        id: token.id,
        lrn: token.lrn.toString(),
        user: user.toJSON(),
        date: token.date.toISOString(),
        ip: '1.2.3.4',
        tags: ['test']
      });
  });

  // - TokenService.create
  test('TokenService.create', async () => {
    const ctx = buildContext('test', { clientIp: '1.2.3.4' })

    expect(await service.create(ctx, user))
      .toEqual(expect.objectContaining({
        id: should.validate(validator.isUUID),
        user: user,
        date: expect.any(Date),
        ip: '1.2.3.4',
        tags: []
      }));
  });

  // - TokenService.list
  test('TokenService.list', async () => {
    expect(await service.list(user))
      .toEqual([
        expect.objectContaining({
          id: token.id
        })
      ]);
  });

  // - TokenService.delete
  test('TokenService.delete', async () => {
    await expect(service.delete(user, token.id))
      .resolves.toBeUndefined();

    const tknRepo = database.connection.getRepository(Token);
    expect(await tknRepo.findOne(token.id))
      .toBeUndefined();
  });

  // - TokenService.encrypt
  test('TokenService.encrypt', async () => {
    expect(service.encrypt(token))
      .toEqual(should.validate(validator.isJWT));
  });

  // - TokenService.verify
  test('TokenService.verify', async () => {
    expect(await service.verify(token.toJSON()))
      .toEqual(expect.objectContaining({
        id: user.id
      }));
  });

  test('TokenService.verify: invalid token', async () => {
    const tk = token.toJSON();

    // Wrong token id
    await expect(service.verify({ ...tk, id: '00000000-0000-0000-0000-000000000000' }))
      .rejects.toEqual(HttpError.Unauthorized());

    // Wrong user id
    await expect(service.verify({ ...tk, user: { ...tk.user!, id: '00000000-0000-0000-0000-000000000000' }}))
      .rejects.toEqual(HttpError.Unauthorized());
  });
});
