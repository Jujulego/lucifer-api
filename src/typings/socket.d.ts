/// <references types="socket.io" />

declare namespace SocketIO {
  // noinspection JSUnusedGlobalSymbols
  interface Socket {
    user: () => Promise<import('data/user/user').User>;
    token: () => Promise<import('data/token/token').Token>;
  }
}
