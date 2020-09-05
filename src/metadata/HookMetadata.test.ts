import { HookMetadata } from './HookMetadata';
import * as hookUtil from '../utils/hookUtil';

describe('decorators: ScanPriority', () => {
  it('should ScanPriority decorator has correctly value', async () => {
    const fn = jest.fn();

    class A {};
    HookMetadata.defineMetadata(A, [
      async (_:any, next: Function) => {
        fn('1-1');
        await next();
        fn('1-2');
      },
      async (_:any, next: Function) => {
        fn('2-1');
        await next();
        fn('2-2');
      }
    ])

    HookMetadata.defineMetadata(A, [
      async (_:any, next: Function) => {
        fn('3-1');
        await next();
        fn('3-2');
      },
      async (_:any, next: Function) => {
        fn('4-1');
        await next();
        fn('4-2');
      }
    ])
    HookMetadata.defineMetadata(A, async (_:any, next: Function) => {
      fn('5-1');
      await next();
      fn('5-2');
    })

    await hookUtil.nestHooks(HookMetadata.getMetadata(A))();

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
