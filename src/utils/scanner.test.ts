import { NameMetadata, ParentMetadata, HookMetadata } from '../metadata';
import { scan } from './scanner';
describe('utils: scanner', () => {
  it('scan node should have correctly execute order', async () => {

    const fn = jest.fn();

    function B(){};
    NameMetadata.defineMetadata(B);
    HookMetadata.defineMetadata(B, async (_:any, next: Function)=>{
      fn('B_1_start')
      await next();
      fn('B_1_end')
    });
    HookMetadata.defineMetadata(B, async (_:any, next: Function)=>{
      fn('B_2_start')
      await next();
      fn('B_2_end')
    });

    function E() {};
    NameMetadata.defineMetadata(E);
    HookMetadata.defineMetadata(E, async (_:any, next: Function)=>{
      fn('E_1_start')
      await next();
      fn('E_1_end')
    });
    HookMetadata.defineMetadata(E, async (_:any, next: Function)=>{
      fn('E_2_start')
      await next();
      fn('E_2_end')
    });

    function C(){};
    NameMetadata.defineMetadata(C);
    HookMetadata.defineMetadata(C, async (_:any, next: Function)=>{
      fn('C_1_start')
      await next();
      fn('C_1_end')
    });

    HookMetadata.defineMetadata(C, async (_:any, next: Function)=>{
      fn('C_2_start')
      await next();
      fn('C_2_end')
    });
    ParentMetadata.defineMetadata(C, [
      E
    ]);


    function D() {};
    NameMetadata.defineMetadata(D);
    HookMetadata.defineMetadata(D, async (_:any, next: Function)=>{
      fn('D_1_start')
      await next();
      fn('D_1_end')
    });
    HookMetadata.defineMetadata(D, async (_:any, next: Function)=>{
      fn('D_2_start')
      await next();
      fn('D_2_end')
    });

    function A() {};
    NameMetadata.defineMetadata(A);
    HookMetadata.defineMetadata(A, async (_:any, next: Function)=>{
      fn('A_1_start')
      await next();
      fn('A_1_end')
    });
    HookMetadata.defineMetadata(A, async (_:any, next: Function)=>{
      fn('A_2_start')
      await next();
      fn('A_2_end')
    });
    ParentMetadata.defineMetadata(A, [
      B,
      C,
      D,
    ]);




    /**
     * |- A
     * |--|-- B
     * |--|-- C
     * |--|---|-- E
     * |--|-- D
     */
    const inputs = new Map();
    inputs.set('name', 'test');
    const contextHookMock = jest.fn();
    const scanNodeHookMock = jest.fn();
    const context = await scan(A, {
      inputs,
      scanContextHook: async (context: any, next: Function) => {
        contextHookMock();
        await next();
      },
      scanNodeHook: async (context: any, next: Function) => {
        scanNodeHookMock();
        await next();
      },
    });
    const results = [
      'A_1_start',
        'A_2_start',

          'B_1_start',
            'B_2_start',
            'B_2_end',
          'B_1_end',

          'C_1_start',
            'C_2_start',
              'E_1_start',
                'E_2_start',
                'E_2_end',
              'E_1_end',
            'C_2_end',
          'C_1_end',

          'D_1_start',
            'D_2_start',
            'D_2_end',
          'D_1_end',

        'A_2_end',
      'A_1_end',
    ];

    expect(fn.mock.calls.flat()).toEqual(results);
    expect(context.inputs.get('name')).toBe('test');
    expect(contextHookMock).toBeCalledTimes(1);
    expect(scanNodeHookMock).toBeCalledTimes(5);
  })
})
