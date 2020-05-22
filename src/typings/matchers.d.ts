/// <references types="jest" />

declare namespace jest {
  // noinspection JSUnusedGlobalSymbols
  interface Matchers<R> {
    // Matchers
    toRespect(matcher: jest.AsymmetricMatcher | object | Array<any>): R
    toValidate<E = any>(validator: (value: E) => boolean): R
  }
}