import { ParentMetadata } from './ParentMetadata';

describe('decorators: Provider', () => {
  it('should Provider decorator has correctly value', () => {
    class Z {};
    ParentMetadata.defineMetadata(Z, [{name:1},{name:2},{name:3}])
    expect(ParentMetadata.getMetadata(Z)).toEqual([{name:1},{name:2},{name:3}]);

    class Y {};
    ParentMetadata.defineMetadata(Y, [{name:1},{name:2},{name:3}]);
    ParentMetadata.defineMetadata(Y, []);
    expect(ParentMetadata.getMetadata(Y)).toEqual([]);
  })

  it('should Provider decorator has correctly many array value', () => {
    class X {};

    class A {};
    class A_1 {};class A_2 {};class A_3 {};class A_4 {};
    class A_5 {};class A_6 {};class A_7 {};class A_8 {};

    ParentMetadata.defineMetadata(X, [
      A,
      [A_1, A_2],
      [A_3, A_4],
      [A_5, A_6],
      [A_7, A_8]
    ]);

    expect(ParentMetadata.getMetadata(X)).toEqual([
      A
    ]);
    expect(ParentMetadata.getMetadata(A)).toEqual([
      A_1, A_2, A_3, A_4, A_5, A_6, A_7, A_8
    ]);
  })

  it('should Provider decorator has correctly deep array value', () => {
    class X {};

    class A_1 {};class A_2 {};class A_3 {};class A_4 {};
    class A_5 {};class A_6 {};class A_7 {};class A_8 {};
    class A_9 {};

    ParentMetadata.defineMetadata(X, [
      [
        A_1, A_2,
        [A_3,
          [A_4,
            [A_5,
              [A_6,
                [A_7, [A_8]]
              ]
            ]
          ]
        ]
      ],
      [A_9],
    ]);

    expect(ParentMetadata.getMetadata(X)).toEqual([
      A_1, A_2, A_9
    ]);
    expect(ParentMetadata.getMetadata(A_2)).toEqual([
      A_3
    ]);
    expect(ParentMetadata.getMetadata(A_3)).toEqual([
      A_4
    ]);
    expect(ParentMetadata.getMetadata(A_4)).toEqual([
      A_5
    ]);
    expect(ParentMetadata.getMetadata(A_5)).toEqual([
      A_6
    ]);
    expect(ParentMetadata.getMetadata(A_6)).toEqual([
      A_7
    ]);
    expect(ParentMetadata.getMetadata(A_7)).toEqual([
        A_8
    ]);
  })

  it('should Provider decorator has correctly composite value', () => {
    class X {};
    class A {};

    class A_1 {};class A_2 {};class A_3 {};class A_4 {};
    class A_5 {};class A_6 {};class A_7 {};class A_8 {};

    class B {};
    class C {};

    class C_1 {};
    class C_1_1 {};class C_1_2 {};
    class C_2{};class C_3{};

    class C_7 {};
    class D {};
    class D_1 {};class D_2 {};class D_2_1 {};class D_2_2 {};
    class D_2_3 {}; class D_2_4 {};class D_2_5 {};class D_2_6 {};
    class D_3 {};

    ParentMetadata.defineMetadata(X, [
      A,
      [A_1, A_2, A_3, A_4, A_5, A_6, A_7, A_8],
      B,
      C,
      [C_1, [C_1_1, C_1_2], C_2, C_3],
      D,
      [D_1, D_2, [D_2_1, D_2_2, D_2_3, D_2_4, D_2_5, D_2_6], D_3]
    ]);

    expect(ParentMetadata.getMetadata(X)).toEqual([A, B, C, D]);
    expect(ParentMetadata.getMetadata(A)).toEqual([A_1, A_2, A_3, A_4, A_5, A_6, A_7, A_8]);

    expect(ParentMetadata.getMetadata(A_1)).toEqual([]);
    expect(ParentMetadata.getMetadata(A_2)).toEqual([]);
    expect(ParentMetadata.getMetadata(A_3)).toEqual([]);
    expect(ParentMetadata.getMetadata(A_4)).toEqual([]);
    expect(ParentMetadata.getMetadata(A_5)).toEqual([]);
    expect(ParentMetadata.getMetadata(A_6)).toEqual([]);
    expect(ParentMetadata.getMetadata(A_7)).toEqual([]);
    expect(ParentMetadata.getMetadata(A_8)).toEqual([]);

    expect(ParentMetadata.getMetadata(B)).toEqual([]);

    expect(ParentMetadata.getMetadata(C)).toEqual([C_1, C_2, C_3]);

    expect(ParentMetadata.getMetadata(C_1)).toEqual([C_1_1, C_1_2]);
    expect(ParentMetadata.getMetadata(C_2)).toEqual([]);
    expect(ParentMetadata.getMetadata(C_3)).toEqual([]);

    expect(ParentMetadata.getMetadata(C_7)).toEqual([]);

    expect(ParentMetadata.getMetadata(D)).toEqual([D_1, D_2, D_3]);
    expect(ParentMetadata.getMetadata(D_2)).toEqual([D_2_1, D_2_2, D_2_3, D_2_4, D_2_5, D_2_6]);
  })

})
