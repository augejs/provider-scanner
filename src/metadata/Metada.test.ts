/* eslint-disable @typescript-eslint/no-empty-function */

import { Metadata } from './Metadata';
describe('metadatas:Metadata.defineExtendArrayMetadata', () => {
  it('should have correctly defineExtendArrayMetadata value', () => {
    function A() {}
    Metadata.defineInsertEndArrayMetadata(A, [1,2,3], A);
    expect(Metadata.getMetadata(A, A)).toEqual([1,2,3]);
    Metadata.defineInsertEndArrayMetadata(A, [4,5,6], A);
    expect(Metadata.getMetadata(A, A)).toEqual([1,2,3,4,5,6]);
  })

  it('should have correctly defineInsertArrayMetadata value', () => {
    function A() {}
    Metadata.defineInsertBeginArrayMetadata(A, [1,2,3], A);
    expect(Metadata.getMetadata(A, A)).toEqual([1,2,3]);
    Metadata.defineInsertBeginArrayMetadata(A, [4,5,6], A);
    expect(Metadata.getMetadata(A, A)).toEqual([4,5,6,1,2,3]);
  })

  it('should have correctly defineMergeObjectMetadata value', () => {
    function A() {}
    Metadata.defineMergeObjectMetadata(A, {name: 1}, A);
    expect(Metadata.getMetadata(A, A)).toEqual({name: 1});
    Metadata.defineMergeObjectMetadata(A, {name: 2}, A);
    expect(Metadata.getMetadata(A, A)).toEqual({name: 2});
    Metadata.defineMergeObjectMetadata(A, {age: 2}, A);
    expect(Metadata.getMetadata(A, A)).toEqual({name: 2, age: 2});
  })
})
