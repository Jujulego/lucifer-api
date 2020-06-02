import { buildContext } from 'context';

// Utils
export async function login(id: string, from: string): Promise<string> {
  const ctx = buildContext('test', { clientIp: from });

  return 'token';
}
