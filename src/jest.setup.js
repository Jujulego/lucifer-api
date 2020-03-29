const { HttpError } = require('middlewares/errors');

// Matchers
expect.extend({
  toBeForbidden(received, msg) {
    const exc = HttpError.Forbidden(msg);

    if (!this.isNot) {
      expect(received).toEqual(exc);
    } else {
      expect(received).not.toEqual(exc);
    }

    return { pass: !this.isNot, message: () => '' };
  }
});
