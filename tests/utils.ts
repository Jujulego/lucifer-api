import { buildContext } from 'context';
import { DIContainer } from 'inversify.config';

import { UserService } from 'users/user.service';

// Utils
export async function login(email: string, password: string, from: string) {
  const ctx = buildContext('test', { clientIp: from });
  const users = DIContainer.get(UserService);

  return await users.login(ctx, email, password);
}
