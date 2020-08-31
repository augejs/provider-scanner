import { Metadata } from './Metadata';
import { hookUtil } from '../utils';

/** @ignore */
export class ChildrenHooksCompositeFunctionMetadata {
  static defineMetadata(target: object, fn: Function):void {
    return Metadata.defineMetadata(ChildrenHooksCompositeFunctionMetadata, target, fn);
  }

  static getMetadata(target: object): Function {
    return Metadata.getMetadata(ChildrenHooksCompositeFunctionMetadata, target) || hookUtil.sequenceHooks;
  }
}
