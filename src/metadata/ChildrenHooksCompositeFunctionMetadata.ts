/* eslint-disable @typescript-eslint/ban-types */
import { HookFunction, sequenceHooks } from '../utils/hookUtil';
import { Metadata } from './Metadata';

/** @ignore */
export class ChildrenHooksCompositeFunctionMetadata {
  static defineMetadata(target: object, fn: HookFunction):void {
    return Metadata.defineMetadata(ChildrenHooksCompositeFunctionMetadata, target, fn);
  }

  static getMetadata(target: object): HookFunction {
    return Metadata.getMetadata(ChildrenHooksCompositeFunctionMetadata, target) as HookFunction ?? sequenceHooks;
  }
}
