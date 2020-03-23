import { version } from '../version';

describe('utils/version', () => {
  test('version', async () => {
    const v = await version();

    expect(v).toHaveProperty('version');
    expect(v).toHaveProperty('commit');
  });
});
