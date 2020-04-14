import { isCStatus, C_STATUSES } from './container.enum';

// Tests
describe('data/container', () => {
  // Tests
  // - isCStatus
  test('isCStatus: valid entries', () => {
    C_STATUSES.forEach(status => {
      expect(isCStatus(status)).toBeTruthy();
    });
  });

  test('isCStatus: invalid entries', () => {
    expect(isCStatus('')).toBeFalsy();
    expect(isCStatus('tomato')).toBeFalsy();
  });
});
