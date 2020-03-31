/// <references types="express" />

declare namespace Express {
  // noinspection JSUnusedGlobalSymbols
  interface Request {
    daemon?: import('data/daemon/daemon').Daemon;
    token?: import('data/token/token').Token;
    user?: import('data/user/user').User;
  }
}
