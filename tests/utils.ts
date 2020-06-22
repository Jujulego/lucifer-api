import { INestApplication } from '@nestjs/common';
import { JwtService } from 'auth/jwt.service';

// Utils
export async function login(app: INestApplication, user: string): Promise<string> {
  const auth = app.get(JwtService);
  return auth.generate(user)
}
