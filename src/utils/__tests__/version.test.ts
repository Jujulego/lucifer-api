import { version } from '../version';

describe('utils/version', () => {
  test('version', () => {
    const v = version();

    expect(v).toHaveProperty('version');
    expect(v).toHaveProperty('commit');
  });
});
