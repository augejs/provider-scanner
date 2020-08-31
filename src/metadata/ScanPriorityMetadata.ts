import { IScanNode } from "../interfaces";
import { Metadata } from './Metadata';

/** @ignore */
export function defaultPrioritySortCompare (a:IScanNode, b:IScanNode):number {
  // the bigger has the higher priority
  return b.priority - a.priority;
}

export class ScanPriorityMetadata {
  static defineMetadata(target: object, priority:number = 0):void {
    /**
     * define the metadata of scan priority
     */
    Metadata.defineMetadata(ScanPriorityMetadata, priority, target);
  }

  static getMetadata(target: object): number {
    return Metadata.getMetadata(ScanPriorityMetadata, target) || 0;
  }
}

export class ScanPrioritySortCompareMetadata {
  /**
   * define the metadata of scan priority sort compare function metadata
   */
  static defineMetadata(target: object, sortCompare:Function):void {
    Metadata.defineMetadata(ScanPrioritySortCompareMetadata, sortCompare, target);
  }

  static getMetadata(target: object):  (a: IScanNode, b: IScanNode) => number {
    return Metadata.getMetadata(ScanPrioritySortCompareMetadata, target) || defaultPrioritySortCompare;
  }
}


