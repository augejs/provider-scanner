import { ParentMetadata } from './ParentMetadata';

describe('decorators: Provider', () => {
  it('should Provider decorator has correctly value', () => {
    class A {};
    ParentMetadata.defineMetadata(A, [{name:1},{name:2},{name:3}])
    expect(ParentMetadata.getMetadata(A)).toEqual([{name:1},{name:2},{name:3}]);

    class B {};
    ParentMetadata.defineMetadata(B, [{name:1},{name:2},{name:3}]);
    ParentMetadata.defineMetadata(B, []);
    expect(ParentMetadata.getMetadata(B)).toEqual([]);
  })
})
