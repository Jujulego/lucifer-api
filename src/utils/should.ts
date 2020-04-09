import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import validator from 'validator';

import { HttpError } from 'middlewares/errors';
import { PLvl, PName } from '../data/permission/permission.enums';
import { isLRN } from './lrn';

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

class IsObjectId implements jest.AsymmetricMatcher {
  // Constructor
  constructor(
    private not: boolean = false
  ) {}

  // Methods
  asymmetricMatch(other?: Types.ObjectId | string): boolean {
    return this.not != (!!other && validator.isMongoId(other.toString()));
  }
}

// Should interface
interface Should {
  objectId: () => IsObjectId,
  validate: <T = any> (validator: (value: T) => boolean) => Validator<T>
}

// Composed matchers
export const shouldPermission = (should: Should, name: PName, level: PLvl) => ({
  _id: should.objectId(),
  name, level
});

export const shouldToken = (should: Should, tags: string[]) => ({
  _id: should.objectId(),
  from: should.validate(validator.isIP),
  createdAt: should.validate(validator.isISO8601),
  tags
});

export const shouldSimpleUser = (should: Should, others: object) => ({
  id: should.objectId(),
  _id: should.objectId(),
  __v: expect.any(Number),
  lrn: should.validate(isLRN),
  email: should.validate(validator.isEmail),

  admin: expect.any(Boolean),
  lastConnexion: should.validate(validator.isISO8601),

  ...others
});

export const shouldUser = (should: Should, others: object) => shouldSimpleUser(should, {
  permissions: expect.arrayContaining([]),
  tokens: expect.arrayContaining([]),

  ...others
});

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
  validate: <T = any> (validator: (value: T) => boolean) => new Validator(validator),

  permission(name: PName, level: PLvl) { return shouldPermission(this, name, level); },
  token(tags: string[] = []) { return shouldToken(this, tags); },

  simpleUser(others: object) { return shouldSimpleUser(this, others); },
  user(others: object) { return shouldUser(this, others); },

  // Inverted
  not: {
    // Utils
    beAllowed: shouldNotBeAllowed,
    beFound: shouldNotBeFound,

    // Matchers
    hashOf: (hash: string) => new HashOf(hash, true),
    hashTo: (hash: string) => new HashTo(hash, true),
    haveLength: (length: number) => new HaveLength(length, true),
    objectId: () => new IsObjectId(true),
    validate: <T = any> (validator: (value: T) => boolean) => new Validator(validator, true),

    permission(name: PName, level: PLvl) { return shouldPermission(this, name, level); },
    token(tags: string[] = []) { return shouldToken(this, tags); },

    simpleUser(others: object) { return shouldSimpleUser(this, others); },
    user(others: object) { return shouldUser(this, others); },
  }
};

export default should;
