import * as hookUtil from './hookUtil';

describe('utils: compositeHook', () => {
  it('composite nest hook should have correct execute order', async ()=> {
    const fn = jest.fn();
    const result = await hookUtil.nestHooks([
      async (_:null, next:Function) => {
        fn(1);
        await next();
        fn(4);
      },
      async (_:null, next:Function) => {
        fn(2);
        await next();
        fn(3);
      }
    ])(null);
    expect(fn.mock.calls.flat()).toEqual([1,2,3,4]);
  })

  it('composite sequence should have correct execute order', async ()=> {
    const fn = jest.fn();
    const result = await hookUtil.sequenceHooks([
      async (_:null) => {
        fn(1);
        fn(2);
      },
      async (_:null) => {
        fn(3);
        fn(4);
      }
    ])(null);
    expect(fn.mock.calls.flat()).toEqual([1,2,3,4]);
  })

  it('compose mixin hooks should have correct execute order', async ()=> {
    const fn = jest.fn();

    const hook:Function = hookUtil.nestHooks(
      [
        async (_:null, next:Function) => {
          fn(1);
          await next();
          fn(12);
        },

        hookUtil.sequenceHooks([
          async (_:null) => {
            fn(2);
          },
          async (_:null) => {
            fn(3);
          }
        ]),

        async (_:null, next:Function) => {
          fn(4);
          await next();
          fn(11);
        },

        hookUtil.sequenceHooks([
          async (_:null) => {
            fn(5);
          },

          hookUtil.nestHooks([
            async (_:null, next:Function) => {
              fn(6);
              await next();
              fn(9);
            },

            hookUtil.sequenceHooks([
              async (_:null) => {
                fn(7);
              },
              async (_:null) => {
                fn(8);
              }
            ]),
          ]),

          async (_:null) => {
            fn(10);
          },
        ]),
      ]
    );

    await hook(null);

    expect(fn.mock.calls.flat()).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
  })

})
