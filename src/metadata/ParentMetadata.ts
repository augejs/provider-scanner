/* eslint-disable @typescript-eslint/ban-types */
import { Metadata } from './Metadata';
export class ParentMetadata {
  /**
   * define the metadata of children
   */
  static defineMetadata(target:object, children: object[]):void {
    function iterateChildren(parentTarget:object, children: object[], parentResults: object[]) {
      let currentParentTarget:object = parentTarget;
      let results:object[] = parentResults;
      for(const child of children) {
        if (Array.isArray(child) && (child as object[]).length > 0) {
          iterateChildren(currentParentTarget, child as object[], results);
        } else {
          currentParentTarget = child;
          results = [];
          parentResults.push(child);
        }
      }
      Metadata.defineInsertEndArrayMetadata(ParentMetadata, parentResults, parentTarget);
    }

    iterateChildren(target, children, []);
  }

  static getMetadata(target:object):object[] {
    return Metadata.getMetadata(ParentMetadata, target) as object[] ?? [];
  }
}
