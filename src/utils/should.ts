import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import validator from 'validator';

import { HttpError } from 'middlewares/errors';

// Utils
export async function shouldNotBeFound<T>(prom: Promise<T>) {
  await expect(prom)
    .rejects.toEqual(expect.objectContaining({
      ...HttpError.NotFound(),
      message: expect.any(String)
    }));
}

export async function shouldNotBeAllowed<T>(prom: Promise<T>) {
  await expect(prom)
    .rejects.toEqual(HttpError.Forbidden('Not allowed'));
}

// Matchers logic
class All implements jest.AsymmetricMatcher {
  // Constructor
  constructor(private matchers: jest.AsymmetricMatcher[]) {}

  // Methods
  asymmetricMatch(other: unknown): boolean {
    return this.matchers.reduce<boolean>((res, matcher) => res && matcher.asymmetricMatch(other), true);
  }
}

// Asymmetric Matchers
class HashTo implements jest.AsymmetricMatcher {
  // Constructor
  constructor(
    private hashed: string,
    private not: boolean = false
  ) {}

  // Methods
  asymmetricMatch(other: string): boolean {
    return this.not != bcrypt.compareSync(other, this.hashed);
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
  // Logic
  all: (...matchers: jest.AsymmetricMatcher[]) => new All(matchers),

  // Matchers
  hashTo: (hash: string) => new HashTo(hash),
  haveLength: (length: number) => new HaveLength(length),
  objectId: () => new IsObjectId(),

  // Inverted
  not: {
    // Utils
    beAllowed: shouldNotBeAllowed,
    beFound: shouldNotBeFound,

    // Matchers
    hashTo: (hash: string) => new HashTo(hash, true),
    haveLength: (length: number) => new HaveLength(length, true),
  }
};

export default should;
