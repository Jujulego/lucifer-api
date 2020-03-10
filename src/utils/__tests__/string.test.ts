import { randomString } from '../string';

// Tests
describe('utils/string', () => {
  // Custom alphabet
  const HEX_ALPHABET = '0123456789abcdef';

  // Tests
  test('randomString: zero length', () => {
    const res = randomString(0);
    expect(res).toEqual("");
  });

  test('randomString: default alphabet', () => {
    const res = randomString(20);

    expect(res).toHaveLength(20);
  });

  test('randomString: custom alphabet', () => {
    const res = randomString(20, HEX_ALPHABET);

    expect(res).toHaveLength(20);
    expect(res).toEqual(expect.stringMatching(/^[0-9a-z]+$/));
  });
});
