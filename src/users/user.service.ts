import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { Auth0User } from './auth0.model';
import { LocalUser } from './local.entity';
import { User } from './user.model';
import { LocalUserService } from './local.service';
import { Auth0UserService } from './auth0.service';

// Service
@Service()
export class UserService {
  // Constructor
  constructor(
    private locals: LocalUserService,
    private auth0: Auth0UserService
  ) {}

  // Methods
  private merge(user: Auth0User, local: LocalUser | null): User {
    if (local && user.id !== local.id) {
      throw HttpError.ServerError(`Trying to merge ${user.id} and ${local.id}`);
    }

    // Merge
    const json = local?.toJSON();

    return {
      id:        user.id,
      email:     user.email,
      emailVerified: user.emailVerified || false,
      username:  user.username,
      name:      user.name,
      nickname:  user.nickname,
      givenName: user.givenName,
      familyName: user.familyName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      picture:   user.picture,
      lastIp:    user.lastIp,
      lastLogin: user.lastLogin,
      blocked:   user.blocked,
      daemons:   json?.daemons
    };
  }

  private join(users: Auth0User[], locals: LocalUser[]): User[] {
    // Simple cases
    if (users.length === 0) return [];
    if (locals.length === 0) return users.map(usr => this.merge(usr, null));

    // Join !
    const result: User[] = [];
    let li = 0;

    for (let i = 0; i < users.length; ++i) {
      const usr = users[i];
      let added = false;

      while (li < locals.length) {
        const lcl = locals[li];

        if (lcl.id > usr.id) break;
        if (lcl.id === usr.id) {
          added = true;
          result.push(this.merge(usr, lcl));

          break;
        }

        ++li;
      }

      if (!added) {
        result.push(this.merge(usr, null));
      }
    }

    return result;
  }

  async list(): Promise<User[]> {
    // Get user list
    const [users, locals] = await Promise.all([
      await this.auth0.list(),
      await this.locals.list()
    ]);

    return this.join(users, locals);
  }

  async get(id: string): Promise<User> {
    const [local, user] = await Promise.all([
      this.locals.get(id),
      this.auth0.get(id)
    ]);

    return this.merge(user!, local);
  }

  async getLocal(id: string): Promise<LocalUser> {
    const [local,] = await Promise.all([
      this.locals.getOrCreate(id),
      this.auth0.get(id)
    ]);

    return local;
  }
}
