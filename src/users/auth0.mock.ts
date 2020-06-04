import { MockService } from 'utils';
import { HttpError } from 'utils/errors';

import { Auth0Service } from 'auth0.service';

import { Auth0User } from './auth0.model';
import { Auth0UserService } from './auth0.service';

// Types
export type MockAuth0User = Omit<Auth0User, 'id'>

// Service
@MockService(Auth0UserService, { singleton: true })
export class MockAuth0UserService extends Auth0UserService {
  // Attributes
  private data: Auth0User[] = [];

  // Constructor
  constructor(
    auth0: Auth0Service
  ) { super(auth0); }

  // Methods
  setMockData(id: string, data: MockAuth0User[]): void {
    this.data = data.map((usr, i) => ({ ...usr, id: `${id}-${i+1}`}));
  }

  async get(id: string): Promise<Auth0User> {
    const user = this.data.find(usr => usr.id === id);

    // Throw if not found
    if (!user) throw HttpError.NotFound(`User ${id} not found`);

    return user;
  }

  async list(): Promise<Auth0User[]> {
    return this.data;
  }
}
