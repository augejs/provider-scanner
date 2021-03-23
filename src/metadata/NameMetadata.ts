/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Metadata } from './Metadata';

/** @ignore */
export class NameMetadata {
  static getLowerCaseName(name:string): string {
    if (!name) return '';
    return (name.charAt(0).toLowerCase() + name.slice(1));
  }

  static concatStringNamePath(name:string, parentNamePath:string | null, pathSplitChar: string):string {
    return  parentNamePath ? `${parentNamePath}${pathSplitChar}${name}` : name;
  }

  static concatArrayNamePath(name:string, parentNamePath:Array<string> | null):Array<string> {
    return [ ...(parentNamePath || []) , name];
  }

  /**
   * define the metadata of name
   */
  static defineMetadata (target: object, name?: string):void {
    const targetName:string = NameMetadata.getLowerCaseName(
      name ?? (target as any)?.name ?? '');
      Metadata.defineMetadata(NameMetadata, targetName, target);
  }

  static getMetadata (target: object):string {
    return Metadata.getMetadata(NameMetadata, target) as string || '';
  }
}







