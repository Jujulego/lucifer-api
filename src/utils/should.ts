import bcrypt from 'bcryptjs';

import { HttpError } from 'errors/errors.model';

// Utils
export async function shouldNotBeFound<T>(prom: Promise<T>) {
  await expect(prom).rejects.toRespect(HttpError.NotFound(expect.any(String)));
}

export async function shouldNotBeAllowed<T>(prom: Promise<T>) {
  await expect(prom).rejects.toEqual(HttpError.Forbidden('Not allowed'));
}

export async function shouldBeUnauthorized<T>(prom: Promise<T>) {
  await expect(prom).rejects.toRespect(HttpError.Unauthorized(expect.any(String)));
}

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
  // Utils
  beUnauthorized: shouldBeUnauthorized,

  // Logic
  all: (...matchers: jest.AsymmetricMatcher[]) => new All(matchers),
  any: (...matchers: jest.AsymmetricMatcher[]) => new Any(matchers),

  // Matchers
  hashOf: (value: string) => new HashOf(value),
  hashTo: (hash: string) => new HashTo(hash),
  haveLength: (length: number) => new HaveLength(length),
  validate: <T = any> (validator: (value: T) => boolean) => new Validator(validator),

  // Inverted
  not: {
    // Utils
    beAllowed: shouldNotBeAllowed,
    beFound: shouldNotBeFound,

    // Matchers
    hashOf: (hash: string) => new HashOf(hash, true),
    hashTo: (hash: string) => new HashTo(hash, true),
    haveLength: (length: number) => new HaveLength(length, true),
    validate: <T = any> (validator: (value: T) => boolean) => new Validator(validator, true),
  }
};

export default should;
