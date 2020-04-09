import { version } from '../version';

describe('utils/version', () => {
  test('version', async () => {
    const v = await version();

    expect(v.version).toEqual(expect.any(String));
    expect(v).toHaveProperty('commit');
  });
});
