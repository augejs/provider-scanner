import * as hookUtil from './hookUtil';
import { HookFunction } from './hookUtil';

describe('utils: compositeHook', () => {
  it('composite nest hook should have correct execute order', async ()=> {
    const fn = jest.fn();

    await hookUtil.nestHooks([
      async (_:unknown, next?:CallableFunction) => {
        fn(1);
        next && await next();
        fn(4);
      },
      async (_:unknown, next?:CallableFunction) => {
        fn(2);
        next && await next();
        fn(3);
      }
    ])(null, hookUtil.noopNext);
    expect(fn.mock.calls.flat()).toEqual([1,2,3,4]);
  })

  it('composite sequence should have correct execute order', async ()=> {
    const fn = jest.fn();
    await hookUtil.sequenceHooks([
      async () => {
        fn(1);
        fn(2);
      },
      async () => {
        fn(3);
        fn(4);
      }
    ])(null, hookUtil.noopNext);
    expect(fn.mock.calls.flat()).toEqual([1,2,3,4]);
  })

  it('compose mixin hooks should have correct execute order', async ()=> {
    const fn = jest.fn();

    const hook:HookFunction = hookUtil.nestHooks(
      [
        async (_:unknown, next?:CallableFunction) => {
          fn(1);
          next && await next();
          fn(12);
        },

        hookUtil.sequenceHooks([
          async () => {
            fn(2);
          },
          async () => {
            fn(3);
          }
        ]),

        async (_:unknown, next?:CallableFunction) => {
          fn(4);
          next && await next();
          fn(11);
        },

        hookUtil.sequenceHooks([
          async () => {
            fn(5);
          },

          hookUtil.nestHooks([
            async (_:unknown, next?:CallableFunction) => {
              fn(6);
              next && await next();
              fn(9);
            },

            hookUtil.sequenceHooks([
              async () => {
                fn(7);
              },
              async () => {
                fn(8);
              }
            ]),
          ]),

          async () => {
            fn(10);
          },
        ]),
      ]
    );

    await hook(null, hookUtil.noopNext);

    expect(fn.mock.calls.flat()).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
  })

})
