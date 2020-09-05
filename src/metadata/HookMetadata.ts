import { Metadata } from './Metadata';

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
  static defineMetadata(target: object, hooks: Function | Function[]):void {
    Metadata.defineInsertEndArrayMetadata(HookMetadata,
      Array.isArray(hooks) ?
      hooks : [ hooks ], target);
  }

  static getMetadata(target: object): Function[] {
    return Metadata.getMetadata(HookMetadata, target) || noopHooks;
  }
}
