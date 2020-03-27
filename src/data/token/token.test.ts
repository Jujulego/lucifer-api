import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import env from 'env';
import { TestContext } from 'bases/context';
import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';

import { Token, TokenContent } from './token';
import TokenRepository from './token.repository';

// Tests
describe('data/token', () => {
  // Connect to database
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL!, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  // Fill database
  let user: User;
  let token: Token;

  beforeEach(async () => {
    // Create a token holder
    user = await (new UserModel({ email: 'test@token.com', password: 'test' })).save();

    // Create a token
    token = user.tokens.create({ token: 'test', from: '1.2.3.4', tags: ['test'] });
    user.tokens.push(token);
    await user.save();
  });

  // Empty database
  afterEach(async () => {
    await user.remove();
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - Token.toJSON
  test('Token.toJSON', () => {
    const obj = token.toJSON();

    expect(obj).not.toHaveProperty('token');
    expect(obj).toHaveProperty('from');
    expect(obj).toHaveProperty('tags');
  });

  // - TokenRepository.create
  test('TokenRepository.create: login', async () => {
    const repo = new TokenRepository();
    const ctx = TestContext.withUser(user, '1.2.3.4');

    const tk = await repo.create(user, ctx, { lrn: user.lrn }, true, '7 days');
    expect(tk.token).toBeDefined();
    expect(tk.from).toEqual(ctx.from);
    expect(tk.tags).toHaveLength(0);

    expect(user.lastConnexion).toBeDefined();
    expect(user.tokens).toHaveLength(2);
    expect(user.tokens[1]).toBe(tk);

    const { lrn } = jwt.verify(tk.token, env.JWT_KEY) as TokenContent;
    expect(lrn).toEqual(user.lrn);
  });

  test('TokenRepository.create: no login', async () => {
    const repo = new TokenRepository();
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await repo.create(user, ctx, { lrn: user.lrn }, false, '7 days');
    expect(user.lastConnexion).toBeUndefined();
  });

  test('TokenRepository.create: with tags', async () => {
    const repo = new TokenRepository();
    const ctx = TestContext.withUser(user, '1.2.3.4');

    const tk = await repo.create(user, ctx, { lrn: user.lrn }, false, '7 days', ['test']);
    expect(tk.tags).toHaveLength(1);
    expect(tk.tags[0]).toEqual('test');
  });

  test('TokenRepository.create: invalid ip', async () => {
    const repo = new TokenRepository();
    const ctx = TestContext.withUser(user, 'tomato');

    await expect(
      repo.create(user, ctx, { lrn: user.lrn }, false, '7 days', ['test'])
    ).rejects.toThrow();
  });

  // - TokenRepository.getById
  test('TokenRepository.getById', () => {
    const repo = new TokenRepository();

    const tk = repo.getTokenById(user, token.id);
    expect(tk).toBe(token);
  });
});
