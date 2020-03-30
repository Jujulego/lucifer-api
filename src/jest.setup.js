// Setup
expect.extend({
  // Matchers
  toRespect(received, matcher) {
    if (Array.isArray(matcher)) {
      matcher = expect.arrayContaining(matcher);
    } else if (!('asymmetricMatch' in matcher)) {
      matcher = expect.objectContaining(matcher);
    }

    if (!this.isNot) {
      expect(received).toEqual(matcher);
    } else {
      expect(received).not.toEqual(matcher);
    }

    return { pass: !this.isNot, message: () => '' };
  }
});
