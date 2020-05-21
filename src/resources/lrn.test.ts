import { LRN } from './lrn.model';

// Test suite
describe('resource/lrn.model', () => {
  // Tests
  test('LRN.isLRN', () => {
    // Valid lrn
    expect(LRN.isLRN('lrn::res:0123456789abcdef')).toBeTruthy();
    expect(LRN.isLRN('lrn::res:0123456789abcdef::child:0123456789abcdef')).toBeTruthy();

    // Invalid lrn
    expect(LRN.isLRN('test')).toBeFalsy();
    expect(LRN.isLRN('lr::res:')).toBeFalsy();
    expect(LRN.isLRN('lr:::0123456789abcdef')).toBeFalsy();
    expect(LRN.isLRN('lr::res:0123456789abcdef')).toBeFalsy();
    expect(LRN.isLRN('lrn:res:0123456789abcdef')).toBeFalsy();
    expect(LRN.isLRN('lrn::res::0123456789abcdef')).toBeFalsy();
  });

  test('LRN.parse (no parent)', () => {
    const lrn = LRN.parse('lrn::res:0123456789abcdef');

    // Checks
    expect(lrn.resource).toEqual('res');
    expect(lrn.id).toEqual('0123456789abcdef');
    expect(lrn.parent).toBeUndefined();
  });

  test('LRN.parse (with parent)', () => {
    const lrn = LRN.parse('lrn::res:0123456789abcdef::child:0123456789abcdef');

    // Checks
    expect(lrn.resource).toEqual('child');
    expect(lrn.id).toEqual('0123456789abcdef');
    expect(lrn.parent).toBeInstanceOf(LRN);
    expect(lrn.parent?.resource).toEqual('res');
    expect(lrn.parent?.id).toEqual('0123456789abcdef');
  });

  test('LRN.toString (no parent)', () => {
    const lrn = new LRN('res', '0123456789abcdef');

    // Checks
    expect(lrn.toString()).toEqual('lrn::res:0123456789abcdef');
  });

  test('LRN.toString (with parent)', () => {
    const lrn = new LRN('child', '0123456789abcdef', new LRN('res', '0123456789abcdef'));

    // Checks
    expect(lrn.toString()).toEqual('lrn::res:0123456789abcdef::child:0123456789abcdef');
  });
});
