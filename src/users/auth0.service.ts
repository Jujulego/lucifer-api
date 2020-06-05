import { Injectable, NotFoundException } from '@nestjs/common';
import { ManagementClient, User } from 'auth0';

import { Auth0User } from './auth0.model';

// Service
@Injectable()
export class Auth0UserService {
  // Constructor
  constructor(
    private auth0: ManagementClient
  ) {}

  // Methods
  private format(user: User): Auth0User {
    // Mandatory fields
    const ath: Auth0User = {
      id:        user.user_id!,
      email:     user.email!,
      emailVerified: user.email_verified || false,
      name:      user.name!,
      nickname:  user.nickname!,
      picture:   user.picture!
    };

    // Optional fields
    if ('username'    in user) ath.username   = user.username;
    if ('given_name'  in user) ath.givenName  = user.given_name;
    if ('family_name' in user) ath.familyName = user.family_name;
    if ('created_at'  in user) ath.createdAt  = user.created_at;
    if ('updated_at'  in user) ath.updatedAt  = user.updated_at;
    if ('last_ip'     in user) ath.lastIp     = user.last_ip;
    if ('last_login'  in user) ath.lastLogin  = user.last_login;
    if ('blocked'     in user) ath.blocked    = user.blocked;

    return ath;
  }

  async get(id: string): Promise<Auth0User> {
    const user = await this.auth0.getUser({ id });

    // Throw if not found
    if (!user) throw new NotFoundException(`User ${id} not found`);

    return this.format(user);
  }

  async list(): Promise<Auth0User[]> {
    const users = await this.auth0.getUsers({ sort: 'user_id:1' });
    return users.map(usr => this.format(usr));
  }
}
