import bcrypt from 'bcryptjs';

import { HTTP_ERRORS, IHttpError } from './errors';

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
  asymmetricMatch(other: Array<unknown> | string): boolean {
    return this.not != (other.length === this.length);
  }
}

class Validator<T> implements jest.AsymmetricMatcher {
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
export const should = {
  // Logic
  all: (...matchers: jest.AsymmetricMatcher[]): All => new All(matchers),
  any: (...matchers: jest.AsymmetricMatcher[]): Any => new Any(matchers),

  // Matchers
  hashOf: (value: string): HashOf => new HashOf(value),
  hashTo: (hash: string): HashTo => new HashTo(hash),
  haveLength: (length: number): HaveLength => new HaveLength(length),
  validate: <T> (validator: (value: T) => boolean): Validator<T> => new Validator(validator),

  // Schemas
  be: {
    httpError(status: keyof typeof HTTP_ERRORS, message: string): IHttpError {
      return {
        status,
        error: HTTP_ERRORS[status],
        message: message
      }
    },

    badRequest(  message?: string): IHttpError { return this.httpError(400, message || HTTP_ERRORS[400])},
    unauthorized(message?: string): IHttpError { return this.httpError(401, message || HTTP_ERRORS[401])},
    forbidden(   message?: string): IHttpError { return this.httpError(403, message || HTTP_ERRORS[403])},
    notFound(    message?: string): IHttpError { return this.httpError(404, message || HTTP_ERRORS[404])},
    serverError( message?: string): IHttpError { return this.httpError(500, message || HTTP_ERRORS[500])}
  },

  // Inverted
  not: {
    // Matchers
    hashOf: (hash: string): HashOf => new HashOf(hash, true),
    hashTo: (hash: string): HashTo => new HashTo(hash, true),
    haveLength: (length: number): HaveLength => new HaveLength(length, true),
    validate: <T> (validator: (value: T) => boolean): Validator<T> => new Validator(validator, true),
  }
};
