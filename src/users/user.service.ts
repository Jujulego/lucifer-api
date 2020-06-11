import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Auth0User } from './auth0.model';
import { LocalUser } from './local.entity';
import { User } from './user.model';
import { LocalUserService, GetLocalUserOptions } from './local.service';
import { Auth0UserService } from './auth0.service';

// Service
@Injectable()
export class UserService {
  // Constructor
  constructor(
    private locals: LocalUserService,
    private auth0: Auth0UserService
  ) {}

  // Methods
  private merge(user: Auth0User, local: LocalUser | null): User {
    if (local && user.id !== local.id) {
      throw new InternalServerErrorException(`Trying to merge ${user.id} and ${local.id}`);
    }

    // Mandatory fields
    const res: User = {
      id:        user.id,
      email:     user.email,
      name:      user.name,
      nickname:  user.nickname
    };

    // Optional fields
    if ('emailVerified' in user) res.emailVerified = user.emailVerified;
    if ('nickname'   in user) res.nickname   = user.nickname;
    if ('username'   in user) res.username   = user.username;
    if ('givenName'  in user) res.givenName  = user.givenName;
    if ('familyName' in user) res.familyName = user.familyName;
    if ('createdAt'  in user) res.createdAt  = user.createdAt;
    if ('updatedAt'  in user) res.updatedAt  = user.updatedAt;
    if ('picture'    in user) res.picture    = user.picture;
    if ('lastIp'     in user) res.lastIp     = user.lastIp;
    if ('lastLogin'  in user) res.lastLogin  = user.lastLogin;
    if ('blocked'    in user) res.blocked    = user.blocked;

    // Local fields
    if (local) {
      if ('daemons' in local) res.daemons = local.daemons;
    }

    return res;
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

  async get(id: string, opts?: GetLocalUserOptions): Promise<User> {
    const [local, user] = await Promise.all([
      this.locals.get(id, opts),
      this.auth0.get(id)
    ]);

    return this.merge(user!, local);
  }

  async getLocal(id: string): Promise<LocalUser> {
    const user = await this.auth0.get(id);

    return this.locals.getOrCreate(id, user);
  }
}
