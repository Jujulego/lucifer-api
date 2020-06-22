import { OverrideByFactoryOptions } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ManagementClient } from 'auth0';

import { Auth0User } from './auth0.model';
import { Auth0UserService } from './auth0.service';

import auth0Mock from 'mocks/auth0.mock.json';

// Mock
export class Auth0UserMock extends Auth0UserService {
  // Constructor
  constructor(
    auth0: ManagementClient,
    private data: Auth0User[]
  ) { super(auth0); }

  // Methods
  async get(id: string): Promise<Auth0User> {
    const user = this.data.find(usr => usr.id === id);

    // Throw if not found
    if (!user) throw new NotFoundException(`User ${id} not found`);

    return user;
  }

  async list(): Promise<Auth0User[]> {
    return this.data;
  }
}

// Factory
export const factoryAuth0UserMock = (pattern: string): OverrideByFactoryOptions => ({
  factory: (auth0: ManagementClient) => new Auth0UserMock(auth0, auth0Mock.map((usr, i) => ({ ...usr, id: `${pattern}-${i+1}`})))
});
