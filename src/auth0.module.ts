import { Module } from '@nestjs/common';

import { AuthenticationClient, ManagementClient } from 'auth0';

import { env } from 'env';

// Clients
const authClient = new AuthenticationClient({
  domain: env.AUTH0_DOMAIN,
  clientId: env.AUTH0_CLIENT_ID
});

const mgmtClient = new ManagementClient({
  domain: env.AUTH0_DOMAIN,
  clientId: env.AUTH0_CLIENT_ID,
  clientSecret: env.AUTH0_CLIENT_SECRET,
  scope: 'read:users update:users'
});

// Module
@Module({
  providers: [
    { provide: AuthenticationClient, useValue: authClient },
    { provide: ManagementClient, useValue: mgmtClient }
  ],
  exports: [
    AuthenticationClient,
    ManagementClient
  ]
})
export class Auth0Module {}
