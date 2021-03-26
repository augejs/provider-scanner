/* eslint-disable @typescript-eslint/ban-types */
import { HookMetadata } from './HookMetadata';
import * as hookUtil from '../utils/hookUtil';

describe('decorators: ScanPriority', () => {
  it('should ScanPriority decorator has correctly value', async () => {
    const fn = jest.fn();

    class A {}
    HookMetadata.defineMetadata(A, [
      async (_, next?: CallableFunction) => {
        fn('1-1');
        next && await next();
        fn('1-2');
      },
      async (_, next?: CallableFunction) => {
        fn('2-1');
        next && await next();
        fn('2-2');
      }
    ])

    HookMetadata.defineMetadata(A, [
      async (_, next?: CallableFunction) => {
        fn('3-1');
        next && await next();
        fn('3-2');
      },
      async (_, next?: CallableFunction) => {
        fn('4-1');
        next && await next();
        fn('4-2');
      }
    ])
    HookMetadata.defineMetadata(A, async (_, next?: CallableFunction) => {
      fn('5-1');
      next && await next();
      fn('5-2');
    })

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await hookUtil.nestHooks(HookMetadata.getMetadata(A))(null, ()=>{});

    expect(fn.mock.calls).toEqual([
      ['1-1'],
      ['2-1'],
      ['3-1'],
      ['4-1'],
      ['5-1'],
      ['5-2'],
      ['4-2'],
      ['3-2'],
      ['2-2'],
      ['1-2'],
    ]);
  })
})
