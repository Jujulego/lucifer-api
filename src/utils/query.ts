// Types
export type QueryFilter<K extends string> = { [key in K]?: any }

// Utils
export function query2filter<K extends string>(query: any, keys: K[]): QueryFilter<K> {
  const filter: QueryFilter<K> = {};

  keys.filter(key => key in query)
    .forEach(key => filter[key] = query[key]);

  return filter;
}
