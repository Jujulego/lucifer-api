import { buildLRN, isLRN, parseLRN } from '../lrn';

// Tests
describe('utils/lrn', () => {
  // isLRN
  // - valid entry
  test('isLRN: valid entry', () => {
    expect(isLRN('lrn::user:0123456789abcdef01234567')).toBeTruthy();
  });

  // - empty entry
  test('isLRN: empty entry', () => {
    expect(isLRN("")).toBeFalsy();
  });

  // - invalid entry
  test('isLRN: invalid entry', () => {
    expect(isLRN('invalid entry !')).toBeFalsy();
  });

  // - invalid header
  test('isLRN: invalid header', () => {
    expect(isLRN('___::user:0123456789abcdef01234567')).toBeFalsy();
  });

  // - invalid type
  test('isLRN: invalid type', () => {
    expect(isLRN('lrn::_+*/:0123456789abcdef01234567')).toBeFalsy();
  });

  // - invalid id
  test('isLRN: invalid id', () => {
    expect(isLRN('lrn::_+*/:0123*567+9a/cdef01234567')).toBeFalsy();
    expect(isLRN('lrn::_+*/:0123456789abcdef012345678')).toBeFalsy();
    expect(isLRN('lrn::_+*/:0123456789abcdef0123456')).toBeFalsy();
  });

  // parseLRN
  // - valid entry
  test('parseLRN: valid entry', () => {
    expect(parseLRN('lrn::user:0123456789abcdef01234567'))
      .toEqual({ type: 'user', id: '0123456789abcdef01234567' });
  });

  // - invalid entry
  test('parseLRN: valid entry', () => {
    expect(parseLRN('invalid entry !')).toBeNull();
  });

  // buildLRN
  test('buildLRN', () => {
    expect(buildLRN({ type: 'user', id: '0123456789abcdef01234567' }))
      .toEqual('lrn::user:0123456789abcdef01234567');
  });
});
