import { PLvl } from 'data/permission/permission.enums';

import { parseLevel } from '../level';

// Tests
describe('utils/level', () => {
  // parseLevel:
  // - number argument
  test('parseLevel: number argument', () => {
    expect(parseLevel(0b1010))
      .toEqual(PLvl.CREATE | PLvl.UPDATE);
  });

  test('parseLevel: number argument extra bits', () => {
    expect(parseLevel(0b101010))
      .toEqual(PLvl.CREATE | PLvl.UPDATE);
  });

  // - numeric string argument
  test('parseLevel: numeric argument', () => {
    expect(parseLevel('10'))
      .toEqual(PLvl.CREATE | PLvl.UPDATE);
  });

  test('parseLevel: numeric argument extra bits', () => {
    expect(parseLevel('42'))
      .toEqual(PLvl.CREATE | PLvl.UPDATE);
  });

  // - text string argument
  test('parseLevel: text argument (comma)', () => {
    expect(parseLevel('CREATE, UPDATE'))
      .toEqual(PLvl.CREATE | PLvl.UPDATE);
  });

  test('parseLevel: text argument (pipe)', () => {
    expect(parseLevel('CREATE | UPDATE'))
      .toEqual(PLvl.CREATE | PLvl.UPDATE);
  });

  test('parseLevel: text argument unknown level', () => {
    expect(parseLevel('CUSTOM'))
      .toEqual(PLvl.NONE);
  });
});
