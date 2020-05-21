// Functions
export type Validator<T = unknown> = (value: T) => boolean;

export type ClassDecorator<T = unknown> = <C extends Newable<T>> (target: C) => C;

// Types
export type Newable<T = unknown> = {
  new (...args: any[]): T; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface WritableStream {
  write(txt: string): void;
}
