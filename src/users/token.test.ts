import validator from 'validator';

import { DatabaseService } from 'db.service';
import DIContainer, { loadServices } from 'inversify.config';
import { HttpError } from 'middlewares/errors';
import { should } from 'utils';

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
        tknRepo.create({ user, tags: ['test'] })
      );
    });
  });

  afterEach(async () => {
    const usrRepo = database.connection.getRepository(User);
    await usrRepo.delete(user.id);
  });

  // Tests
  // - Token.toJSON
  test('Token.toJSON', () => {
    expect(token.toJSON())
      .toEqual({
        id: token.id,
        date: expect.any(Date),
        tags: ['test'],
        user: user.toJSON()
      });
  });

  // - TokenService.create
  test('TokenService.create', async () => {
    expect(await service.create(user))
      .toEqual({
        id: should.validate(validator.isUUID),
        date: expect.any(Date),
        user: user,
        tags: []
      });
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