import 'reflect-metadata';

// Constants
const FIELDS_METADATA = Symbol('utils.json:fields');

// Types
interface Field {
  name: string | symbol;
  property: string | symbol;
  transform?: (val: any) => any;
}

export type JSONTransform<T> = (val: T) => any;
export interface JSONOptions<T> {
  name?: string | symbol;
  transform?: JSONTransform<T>;
}

// Utils
function resolveOptions<T>(arg?: string | symbol | JSONTransform<T> | JSONOptions<T>): JSONOptions<T> {
  switch (typeof arg) {
    case 'string':
    case 'symbol':
      return { name: arg };

    case 'function':
      return { transform: arg };

    case 'object':
      return arg;

    default:
      return {}
  }
}

export function toJSON<R = any>(target: any): R {
  // Only for objects
  if (typeof target !== 'object') {
    return target;
  }

  // get metadata
  let fields = Reflect.getMetadata(FIELDS_METADATA, target) as Field[];
  if (!fields) return target;

  // Build object
  const obj: any = {};
  fields.forEach(field => {
    let val = target[field.property];
    if (val === undefined) return;

    // Transform value
    if (field.transform) {
      val = field.transform(val);
    } else if (Array.isArray(val)) {
      val = val.map(v => v.toJSON ? v.toJSON() : toJSON(v));
    } else if (val.toJSON) {
      val = val.toJSON ? val.toJSON() : toJSON(val);
    }

    obj[field.name] = val;
  });

  return obj;
}

// Decorator
export function json<T>(arg?: string | symbol | JSONTransform<T> | JSONOptions<T>) {
  const opts = resolveOptions<T>(arg);

  return (target: object, propertyName: string | symbol, _?: TypedPropertyDescriptor<T>) => {
    // get metadata
    let fields = Reflect.getMetadata(FIELDS_METADATA, target) as Field[];
    if (!fields) fields = [];

    // define metadata
    fields.push({
      name: opts.name || propertyName,
      property: propertyName,
      transform: opts.transform
    });

    Reflect.defineMetadata(FIELDS_METADATA, fields, target);
  }
}
