import { Metadata } from './Metadata';
export class ParentMetadata {
  /**
   * define the metadata of children
   */
  static defineMetadata(target:object, children: object[]):void {
    Metadata.defineMetadata(ParentMetadata, children, target);
  }

  static getMetadata(target:object):object[] {
    return Metadata.getMetadata(ParentMetadata, target) || [];
  }
}
