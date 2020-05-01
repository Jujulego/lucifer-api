import { DIContainer } from 'inversify.config';

import { UserService } from 'users/user.service';

// Utils
export async function login(email: string, password: string, from: string) {
  const users = DIContainer.get(UserService);

  return await users.login(email, password);
}
