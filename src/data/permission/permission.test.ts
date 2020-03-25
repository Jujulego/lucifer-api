import { isPLvl, isPName, LEVELS, PERMISSIONS } from './permission.enums';

// Tests
describe("data/permission", () => {
  // Tests
  // - isPLvl
  test('isPLvl: valid entries', () => {
    LEVELS.forEach(lvl => {
      expect(isPLvl(lvl)).toBeTruthy();
    });
  });

  test('isPLvl: invalid entries', () => {
    expect(isPLvl('')).toBeFalsy();
    expect(isPLvl('- this is not a permission level !')).toBeFalsy();
  });

  // - isPName
  test('isPName: valid entries', () => {
    PERMISSIONS.forEach(name => {
      expect(isPName(name)).toBeTruthy();
    });
  });

  test('isPName: invalid entries', () => {
    expect(isPName('')).toBeFalsy();
    expect(isPName('- this is not a permission name !')).toBeFalsy();
  });
});
