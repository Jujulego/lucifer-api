// Functions
export type Validator<T = unknown> = (value: T) => boolean;

export type ClassDecorator<T = unknown> = <C extends Newable<T>> (target: C) => C;
export type MethodDecorator<C = unknown, B = unknown> = <T extends B> (target: C, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => void;

// Types
export type Newable<T = unknown> = {
  new (...args: unknown[]): T;
}

export interface WritableStream {
  write(txt: string): void;
}
