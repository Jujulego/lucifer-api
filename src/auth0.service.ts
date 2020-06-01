import { AuthenticationClient, ManagementClient } from 'auth0';

import { env } from 'env';
import { Service } from 'utils';

// Service
@Service({ singleton: true })
export class Auth0Service {
  // Attributes
  readonly authClient: AuthenticationClient;
  readonly mgmtClient: ManagementClient;

  // Constructor
  constructor() {
    // Setup
    this.authClient = new AuthenticationClient({
      domain: env.AUTH0_DOMAIN,
      clientId: env.AUTH0_CLIENT_ID
    });

    this.mgmtClient = new ManagementClient({
      domain: env.AUTH0_DOMAIN,
      clientId: env.AUTH0_CLIENT_ID,
      clientSecret: env.AUTH0_CLIENT_SECRET,
      scope: 'read:users'
    });
  }
}
