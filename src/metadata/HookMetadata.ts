import { Metadata } from './Metadata';
import { HookFunction } from '../utils';

/** @ignore */
const noopHooks = [
  async (_: any, next: Function) => {
    await next();
  }
];

export class HookMetadata {
  /**
   * define the metadata of hooks
   */
  static defineMetadata(target: object, hooks: HookFunction | HookFunction[]):void {
    Metadata.defineInsertEndArrayMetadata(HookMetadata,
      Array.isArray(hooks) ?
      hooks : [ hooks ], target);
  }

  static getMetadata(target: object): HookFunction[] {
    return Metadata.getMetadata(HookMetadata, target) as HookFunction[] || noopHooks;
  }
}
