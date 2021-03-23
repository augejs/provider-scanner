/* eslint-disable @typescript-eslint/ban-types */

import { HookFunction, noopHook } from '../utils/hookUtil';
import { Metadata } from './Metadata';

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
    return Metadata.getMetadata(HookMetadata, target) as HookFunction[] || [ noopHook ];
  }
}
