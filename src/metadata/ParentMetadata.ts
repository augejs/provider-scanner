import { Metadata } from './Metadata';
export class ParentMetadata {
  /**
   * define the metadata of children
   */
  static defineMetadata(target:object, children: any[]):void {
    function iterateChildren(parentTarget:any, children: any[], parentResults: any[]) {
      let currentParentTarget:any = parentTarget;
      let results:any = parentResults;
      for(const child of children) {
        if (Array.isArray(child) && (child as any[]).length > 0) {
          iterateChildren(currentParentTarget, child as any[], []);
        } else {
          currentParentTarget = child;
          results.push(child);
        }
      }
      Metadata.defineMetadata(ParentMetadata, results, parentTarget);
    }

    iterateChildren(target, children, []);
  }

  static getMetadata(target:object):object[] {
    return Metadata.getMetadata(ParentMetadata, target) || [];
  }
}
