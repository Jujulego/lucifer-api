import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { ManagementClient, User } from 'auth0';

import { Auth0User, UpdateAuth0User } from './auth0.model';

// Service
@Injectable()
export class Auth0UserService {
  // Constructor
  constructor(
    private auth0: ManagementClient
  ) {}

  // Methods
  private static format(user: User): Auth0User {
    // Mandatory fields
    const ath: Auth0User = {
      id:        user.user_id!,
      name:      user.name!,
      email:     user.email!
    };

    // Optional fields
    if ('email_verified' in user) ath.emailVerified = user.email_verified;
    if ('nickname'    in user) ath.nickname   = user.nickname;
    if ('username'    in user) ath.username   = user.username;
    if ('given_name'  in user) ath.givenName  = user.given_name;
    if ('family_name' in user) ath.familyName = user.family_name;
    if ('created_at'  in user) ath.createdAt  = user.created_at;
    if ('updated_at'  in user) ath.updatedAt  = user.updated_at;
    if ('picture'     in user) ath.picture    = user.picture;
    if ('last_ip'     in user) ath.lastIp     = user.last_ip;
    if ('last_login'  in user) ath.lastLogin  = user.last_login;
    if ('blocked'     in user) ath.blocked    = user.blocked;

    return ath;
  }

  private static async catch<R>(fn: () => Promise<R>): Promise<R> {
    try {
      return await fn();
    } catch (error) {
      if (error.statusCode && error.message) {
        throw new HttpException(HttpException.createBody(error.message), error.statusCode);
      }

      throw error;
    }
  }

  async get(id: string): Promise<Auth0User> {
    const user = await Auth0UserService.catch(
      () => this.auth0.getUser({ id })
    );

    // Throw if not found
    if (!user) throw new NotFoundException(`User ${id} not found`);

    return Auth0UserService.format(user);
  }

  async list(): Promise<Auth0User[]> {
    const users = await Auth0UserService.catch(() =>
      this.auth0.getUsers({ sort: 'user_id:1' })
    );

    return users.map(usr => Auth0UserService.format(usr));
  }

  async update(id: string, update: UpdateAuth0User): Promise<Auth0User> {
    const user = await Auth0UserService.catch(() =>
      this.auth0.updateUser({ id }, { name: update.name, email: update.email })
    );

    // Throw if not found
    if (!user) throw new NotFoundException(`User ${id} not found`);

    return Auth0UserService.format(user);
  }
}
