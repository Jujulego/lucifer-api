import bcrypt from 'bcryptjs';

import { HTTP_ERRORS } from 'errors/errors.constants';

// Matchers logic
class All implements jest.AsymmetricMatcher {
  // Constructor
  constructor(private matchers: jest.AsymmetricMatcher[]) {}

  // Methods
  asymmetricMatch(other: unknown): boolean {
    let res = true;
    let i = 0;

    while (res && i < this.matchers.length) {
      res = res && this.matchers[i].asymmetricMatch(other);
      ++i;
    }

    return res;
  }
}

class Any implements jest.AsymmetricMatcher {
  // Constructor
  constructor(private matchers: jest.AsymmetricMatcher[]) {}

  // Methods
  asymmetricMatch(other: unknown): boolean {
    let res = false;
    let i = 0;

    while (!res && i < this.matchers.length) {
      res = res || this.matchers[i].asymmetricMatch(other);
      ++i;
    }

    return res;
  }
}

// Asymmetric Matchers
class HashOf implements jest.AsymmetricMatcher {
  // Constructor
  constructor(
    private value: string,
    private not: boolean = false
  ) {}

  // Methods
  asymmetricMatch(other: string): boolean {
    return this.not != bcrypt.compareSync(this.value, other);
  }
}

class HashTo implements jest.AsymmetricMatcher {
  // Constructor
  constructor(
    private hash: string,
    private not: boolean = false
  ) {}

  // Methods
  asymmetricMatch(other: string): boolean {
    return this.not != bcrypt.compareSync(other, this.hash);
  }
}

class HaveLength implements jest.AsymmetricMatcher {
  // Constructor
  constructor(
    private length: number,
    private not: boolean = false
  ) {}

  // Methods
  asymmetricMatch(other: Array<any> | string): boolean {
    return this.not != (other.length === this.length);
  }
}

class Validator<T = any> implements jest.AsymmetricMatcher {
  // Constructor
  constructor(
    private validator: (value: T) => boolean,
    private not: boolean = false
  ) {}

  // Methods
  asymmetricMatch(other: T): boolean {
    return this.not != this.validator(other);
  }
}

// Namespace
const should = {
  // Logic
  all: (...matchers: jest.AsymmetricMatcher[]) => new All(matchers),
  any: (...matchers: jest.AsymmetricMatcher[]) => new Any(matchers),

  // Matchers
  hashOf: (value: string) => new HashOf(value),
  hashTo: (hash: string) => new HashTo(hash),
  haveLength: (length: number) => new HaveLength(length),
  validate: <T = any> (validator: (value: T) => boolean) => new Validator(validator),

  // Schemas
  be: {
    httpError(status: keyof typeof HTTP_ERRORS, message: string) {
      return {
        status,
        error: HTTP_ERRORS[status],
        message: message
      }
    },

    badRequest(  message?: string) { return this.httpError(400, message || HTTP_ERRORS[400])},
    unauthorized(message?: string) { return this.httpError(401, message || HTTP_ERRORS[401])},
    forbidden(   message?: string) { return this.httpError(403, message || HTTP_ERRORS[403])},
    notFound(    message?: string) { return this.httpError(404, message || HTTP_ERRORS[404])},
    serverError( message?: string) { return this.httpError(500, message || HTTP_ERRORS[500])}
  },

  // Inverted
  not: {
    // Matchers
    hashOf: (hash: string) => new HashOf(hash, true),
    hashTo: (hash: string) => new HashTo(hash, true),
    haveLength: (length: number) => new HaveLength(length, true),
    validate: <T = any> (validator: (value: T) => boolean) => new Validator(validator, true),
  }
};

export default should;
