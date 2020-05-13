import { DIContainer } from 'inversify.config';

import { DatabaseService } from 'db.service';
import { Role } from 'roles/role.entity';
import { User } from 'users/user.entity';
import { UserService } from 'users/user.service';

// Utils
export async function login(email: string, password: string, from: string) {
  const users = DIContainer.get(UserService);

  return await users.login(email, password);
}

export function createAdmin(email: string): User {
  const database = DIContainer.get(DatabaseService);

  const rolRepo = database.connection.getRepository(Role);
  const usrRepo = database.connection.getRepository(User);

  return usrRepo.create({
    role: rolRepo.create({ create: true, read: true, write: true, delete: true }),
    email, password: 'admin'
  });
}
