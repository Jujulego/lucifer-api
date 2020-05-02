// Functions
export type Validator = (value: any) => boolean;

// Types
export type Newable<T> = {
  new (...args: any[]): T
}
