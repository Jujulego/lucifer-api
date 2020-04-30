import 'reflect-metadata';

// Constants
const JSON_METADATA = 'utils:json';

// Types
interface Field {
  name: string | symbol;
  property: string | symbol;
  transform?: (val: any) => any;
}

export interface JSONOptions<T> {
  name?: string | symbol;
  transform?: (val: T) => any;
}

// Decorator
export function json<T>(opts?: JSONOptions<T>) {
  return (target: object, propertyName: string | symbol, descriptor?: TypedPropertyDescriptor<T>) => {
    // get metadata
    let fields = Reflect.getMetadata(JSON_METADATA, target) as Field[];
    if (!fields) fields = [];

    // define metadata
    fields.push({
      name: opts?.name || propertyName,
      property: propertyName,
      transform: opts?.transform
    });

    Reflect.defineMetadata(JSON_METADATA, fields, target);
  }
}

// Utils
export function toJSON(target: any): any {
  // get metadata
  let fields = Reflect.getMetadata(JSON_METADATA, target) as Field[];
  if (!fields) return target;

  // Build object
  const obj: any = {};
  fields.forEach(field => {
    let val = target[field.property];
    if (val === undefined) return;

    if (field.transform) {
      val = field.transform(val);
    } else if (Array.isArray(val)) {
      val = val.map(v => v.toJSON ? v.toJSON() : v);
    } else if (val.toJSON) {
      val = val.toJSON();
    }

    obj[field.name] = val;
  });

  return obj;
}
