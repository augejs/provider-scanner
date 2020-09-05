import 'reflect-metadata';
import extend from 'extend';

export class Metadata {
  static defineMetadata (metadataKey:any, metadataValue:any, target: object):void {
    Reflect.defineMetadata(metadataKey, metadataValue, target);
  }

  static getMetadata (metadataKey: any, target: object):any {
    return Reflect.getMetadata(metadataKey, target);
  }

  static hasMetadata(metadataKey: any, target: object):boolean {
    return Reflect.hasMetadata(metadataKey, target);
  }

  static defineInsertEndArrayMetadata(key: any, metadata: any[], target: object):void {
    const previousValue:[] = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, ...metadata];
    Reflect.defineMetadata(key, value, target);
  }

  static defineInsertBeginArrayMetadata(key: any, metadata: any[], target: object):void {
    const previousValue:[] = Reflect.getMetadata(key, target) || [];
    const value = [...metadata, ...previousValue];
    Reflect.defineMetadata(key, value, target);
  }

  static defineMergeObjectMetadata(key: any, metadata: any,target: any):void {
    const previousValue:any = Reflect.getMetadata(key, target);

    if (typeof previousValue === 'object' && typeof metadata === 'object') {
      const mergeConfig:any = extend(true, {}, previousValue, metadata);
      Reflect.defineMetadata(key, mergeConfig, target);
      return;
    }

    Reflect.defineMetadata(key, metadata, target);
  }

  static decorate(decorators: ClassDecorator[], target: Function) {
    Reflect.decorate(decorators, target);
  }
}
