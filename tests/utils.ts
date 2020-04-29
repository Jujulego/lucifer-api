import DIContainer from 'inversify.config';
import { TestContext } from 'bases/context';

import { UserService } from 'users/user.service';

// Utils
export async function login(email: string, password: string, from: string) {
  const users = DIContainer.get(UserService);
  const ctx = TestContext.notConnected(from);

  return await users.login(email, password);
}
