import { query2filter } from '../query';

// Tests
describe('utils/query', () => {
  const query = {
    a: 85,
    b: '85',
    c: ['8', '5'],
    d: null
  };

  // query2filter
  test('query2filter: all keys', () => {
    const filter = query2filter<keyof typeof query>(query, ['a', 'b', 'c', 'd']);

    expect(filter).toEqual(query);
  });

  test('query2filter: no key', () => {
    const filter = query2filter<keyof typeof query>(query, []);

    expect(filter).toEqual({});
  });

  test('query2filter: some keys', () => {
    const filter = query2filter<keyof typeof query>(query, ['a', 'c']);

    expect(filter).toHaveProperty('a');
    expect(filter.a).toEqual(query.a);

    expect(filter).toHaveProperty('c');
    expect(filter.c).toEqual(query.c);

    expect(filter).not.toHaveProperty('b');
    expect(filter).not.toHaveProperty('d');
  });
});
