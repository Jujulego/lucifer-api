import { User as Auth0User } from 'auth0';

import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { Auth0Service } from 'auth0.service';

import { User } from './user.model';
import { LocalUser } from './local.entity';
import { LocalService } from './local.service';

// Service
@Service()
export class UserService {
  // Constructor
  constructor(
    private locals: LocalService,
    private auth0: Auth0Service
  ) {}

  // Methods
  private merge(user: Auth0User, local: LocalUser | null): User {
    if (local && user.user_id !== local.id) {
      throw HttpError.ServerError(`Trying to merge ${user.user_id} and ${local.id}`);
    }

    // Merge
    const json = local?.toJSON();

    return {
      id:        user.user_id!,
      email:     user.email!,
      emailVerified: user.email_verified || false,
      username:  user.username,
      name:      user.name!,
      nickname:  user.nickname,
      givenName: user.given_name,
      familyName: user.family_name,
      createdAt: user.created_at!,
      updatedAt: user.updated_at,
      picture:   user.picture!,
      lastIp:    user.last_ip,
      lastLogin: user.last_login,
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

        if (lcl.id > usr.user_id!) break;
        if (lcl.id === usr.user_id) {
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
      await this.auth0.mgmtClient.getUsers({ sort: 'user_id:1' }),
      await this.locals.list()
    ]);

    return this.join(users, locals);
  }

  async get(id: string): Promise<User> {
    const [local, user] = await Promise.all([
      this.locals.get(id),
      this.auth0.mgmtClient.getUser({ id })
    ]);

    // Throw if not found
    if (!user) throw HttpError.NotFound(`User ${id} not found`);

    return this.merge(user, local);
  }

  async getLocal(id: string): Promise<LocalUser> {
    const [local, user] = await Promise.all([
      this.locals.getOrCreate(id),
      this.auth0.mgmtClient.getUser({ id })
    ]);

    // Throw if not found
    if (!user) throw HttpError.NotFound(`User ${id} not found`);

    return local;
  }
}
