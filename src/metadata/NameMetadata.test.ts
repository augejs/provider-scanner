import { NameMetadata } from './NameMetadata';

describe('decorators: Name', () => {
  it('should Name decorator has correctly value', () => {
    const A = {
      name: 'a'
    };
    const B = {};
    const C = {};
    const D = ()=>{};
    class E {};

    NameMetadata.defineMetadata(A);
    expect(NameMetadata.getMetadata(A)).toBe('a');

    NameMetadata.defineMetadata(A, 'hello');
    expect(NameMetadata.getMetadata(A)).toBe('hello');

    NameMetadata.defineMetadata(C, 'hello2');
    NameMetadata.defineMetadata(C, 'hello1');
    expect(NameMetadata.getMetadata(C)).toBe('hello1');

    NameMetadata.defineMetadata(D);
    expect(NameMetadata.getMetadata(D)).toBe('d');

    NameMetadata.defineMetadata(E);
    expect(NameMetadata.getMetadata(E)).toBe('e');
  })
})

describe('utils: name getFunctionLowerCaseName', () => {
  it('should have correct function lower cause name', () => {
    function AA() {};
    expect(NameMetadata.getLowerCaseName(AA.name)).toBe('aA');
  })
})

describe("utils: name concatStringNamePath", () => {
  it('should have correctly name path when parentNamePath is null', () => {
    expect(NameMetadata.concatStringNamePath('name', null, '.')).toBe('name');
  })

  it('should have correctly name path when parentNamePath is not null', () => {
    expect(NameMetadata.concatStringNamePath('name', 'parent', '.')).toBe('parent.name');
  })
})

describe('utils: name concatArrayNamePath', () => {
  it('should have correctly name path when parentNamePath is null', () => {
    expect(NameMetadata.concatArrayNamePath('name', null)).toEqual(['name']);
  })

  it('should have correctly name path when parentNamePath is not null', () => {
    expect(NameMetadata.concatArrayNamePath('name', ["parent"])).toEqual(['parent', 'name']);
  })
})
