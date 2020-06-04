// Functions
export type Validator<T = unknown> = (value: T) => boolean;

export type ClassDecorator<T = unknown> = <C extends Newable<T>> (target: C) => C;
export type MethodDecorator<C = object, B = unknown> = <T extends B> (target: C, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => void;

// Types
export type Newable<T = unknown> = {
  new (...args: any[]): T; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface WritableStream {
  write(txt: string): void;
}
