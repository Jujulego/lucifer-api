// Utils
function makeMatcher(matcher) {
  if (typeof matcher === 'object') {
    if (Array.isArray(matcher)) {
      return expect.arrayContaining(matcher);
    } else if ('asymmetricMatch' in matcher) {
      return matcher;
    } else {
      return expect.objectContaining(matcher);
    }
  } else {
    return matcher;
  }
}

// Setup
expect.extend({
  // Matchers
  toRespect(received, matcher) {
    matcher = makeMatcher(matcher);

    if (!this.isNot) {
      expect(received).toEqual(matcher);
    } else {
      expect(received).not.toEqual(matcher);
    }

    return { pass: !this.isNot, message: () => '' };
  },

  toValidate(received, validator) {
    return {
      pass: validator(received),
      message: () => `expect '${received}' to ${this.isNot ? 'not' : ''} validate ${validator.name}`
    };
  }
});
