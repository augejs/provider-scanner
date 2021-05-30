/* eslint-disable @typescript-eslint/ban-types */
import { ScanNode } from '../interfaces';
import { Metadata } from './Metadata';

type PrioritySortCompareFn = (a: ScanNode, b: ScanNode) => number;

/** @ignore */
export const defaultPrioritySortCompare: PrioritySortCompareFn = (
  a: ScanNode,
  b: ScanNode,
): number => {
  // the bigger has the higher priority
  return b.priority - a.priority;
};

export class ScanPriorityMetadata {
  static defineMetadata(target: object, priority = 0): void {
    /**
     * define the metadata of scan priority
     */
    Metadata.defineMetadata(ScanPriorityMetadata, priority, target);
  }

  static getMetadata(target: object): number {
    return (Metadata.getMetadata(ScanPriorityMetadata, target) as number) ?? 0;
  }
}

export class ScanPrioritySortCompareMetadata {
  /**
   * define the metadata of scan priority sort compare function metadata
   */
  static defineMetadata(
    target: object,
    sortCompare: PrioritySortCompareFn,
  ): void {
    Metadata.defineMetadata(
      ScanPrioritySortCompareMetadata,
      sortCompare,
      target,
    );
  }

  static getMetadata(target: object): (a: ScanNode, b: ScanNode) => number {
    return (
      (Metadata.getMetadata(
        ScanPrioritySortCompareMetadata,
        target,
      ) as PrioritySortCompareFn) || defaultPrioritySortCompare
    );
  }
}
