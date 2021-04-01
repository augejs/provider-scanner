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

  it('composite sequenceReversedHooks should have correct execute order', async ()=> {
    const fn = jest.fn();
    await hookUtil.sequenceReversedHooks([
      async () => {
        fn(1);
        fn(2);
      },
      async () => {
        fn(3);
        fn(4);
      }
    ])(null, hookUtil.noopNext);
    expect(fn.mock.calls.flat()).toEqual([3,4, 1,2]);
  })

  it('composite parallelHooks should have correct behavior', async ()=> {
    const fn = jest.fn();
    await hookUtil.parallelHooks([
      async () => {
        await fn();
      },
      async () => {
        await fn();
      },
    ])(null, hookUtil.noopNext);
    expect(fn).toBeCalledTimes(2);

    fn.mockClear();

    await hookUtil.parallelReversedHooks([
      async () => {
        await fn();
      },
      async () => {
        await fn();
      },
    ])(null, hookUtil.noopNext);
    expect(fn).toBeCalledTimes(2);
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

  it("conditionHook should have correct behavior", async () => {

    const conditionFn = jest.fn();
    const nextFn = jest.fn();
    const hook = jest.fn();

    conditionFn.mockClear();
    nextFn.mockClear();
    hook.mockClear();

    conditionFn.mockReturnValue(false);

    await hookUtil.conditionHook(conditionFn, hook)(null, nextFn);
    expect(conditionFn).toBeCalled();
    expect(nextFn).toBeCalled();
    expect(hook).not.toBeCalled();
    // --
    conditionFn.mockClear();
    nextFn.mockClear();
    hook.mockClear();

    conditionFn.mockReturnValue(true);

    await hookUtil.conditionHook(conditionFn, hook)(null, nextFn);
    expect(conditionFn).toBeCalled();
    expect(nextFn).not.toBeCalled();
    expect(hook).toBeCalled();
  })

  it("bindHookContext should have correct behavior", async () => {

    const ctx1 = {};
    const ctx2 = {};
    const nextFn = jest.fn();
    const hook = jest.fn();

    await hookUtil.bindHookContext(ctx2, hook)(ctx1, nextFn);

    expect(hook).toBeCalledWith(ctx2, hookUtil.noopNext);
    expect(nextFn).toBeCalledWith(ctx1, hookUtil.noopNext);
  })

  it("ensureHooks should have correct behavior", async () => {

    expect(hookUtil.ensureHooks(null)).toEqual([]);
    expect(hookUtil.ensureHooks([])).toEqual([]);
    expect(hookUtil.ensureHooks("111" as unknown as [])).toEqual([]);

    const fn = jest.fn();
    expect(hookUtil.ensureHooks(fn)).toEqual([fn]);
  })

  it("noopHook should have correct behavior", async () => {
    const nextFn = jest.fn();
    await hookUtil.noopHook(null, nextFn);
    expect(nextFn).toBeCalled();
  })

})
