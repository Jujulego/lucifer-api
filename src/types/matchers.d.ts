declare namespace jest {
  // noinspection JSUnusedGlobalSymbols
  interface Matchers<R> {
    // Http Errors
    toBeForbidden(msg?: string): R;
  }
}
