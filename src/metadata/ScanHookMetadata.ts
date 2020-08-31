import { Metadata } from './Metadata';

/** @ignore */
const noopHooks = [
  async (_: any, next: Function) => {
    await next();
  }
];

export class ScanHookMetadata {
  /**
   * define the metadata of hooks
   */
  static defineMetadata(target: object, hooks: Function | Function[]):void {
    Metadata.defineInsertEndArrayMetadata(ScanHookMetadata,
      Array.isArray(hooks) ?
      hooks : [ hooks ], target);
  }

  static getMetadata(target: object): Function[] {
    return Metadata.getMetadata(ScanHookMetadata, target) || noopHooks;
  }
}
