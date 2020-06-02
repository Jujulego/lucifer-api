import { DIContainer } from 'inversify.config';
import { JWTService } from 'auth/jwt.service';

// Utils
export async function login(user: string): Promise<string> {
  const auth = DIContainer.get(JWTService);
  return auth.generate(user)
}
