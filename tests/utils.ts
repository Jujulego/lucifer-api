import DIContainer from 'inversify.config';

import { Credentials } from 'data/user/user';

import UsersService, { LoginToken } from 'services/users.service';
import { TestContext } from 'bases/context';

// Utils
export async function userLogin(cred: Credentials, from: string): Promise<LoginToken> {
  const users = DIContainer.get(UsersService);
  const ctx = TestContext.notConnected(from);

  return await users.login(ctx, cred, ['Tests']);
}
