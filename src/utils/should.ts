import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import validator from 'validator';

import { HttpError } from 'middlewares/errors';

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

class IsObjectId implements jest.AsymmetricMatcher {
  // Methods
  asymmetricMatch(other?: Types.ObjectId | string): boolean {
    return !!other && validator.isMongoId(other.toString());
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
  objectId: () => new IsObjectId(),

  // Inverted
  not: {
    // Utils
    beAllowed: shouldNotBeAllowed,
    beFound: shouldNotBeFound,

    // Matchers
    hashOf: (hash: string) => new HashOf(hash, true),
    hashTo: (hash: string) => new HashTo(hash, true),
    haveLength: (length: number) => new HaveLength(length, true),
  }
};

export default should;
