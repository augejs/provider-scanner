import 'reflect-metadata';
import extend from 'extend';

export class Metadata {
  static defineMetadata (metadataKey:any, metadataValue:any, target: Object, propertyKey?: string | symbol):void {
    if (!propertyKey) {
      Reflect.defineMetadata(metadataKey, metadataValue, target);
    } else {
      Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
    }
  }

  static getMetadata (metadataKey: any, target: Object, propertyKey?: string | symbol):any {
    if (!propertyKey) {
      return Reflect.getMetadata(metadataKey, target);
    } else {
      return Reflect.getMetadata(metadataKey, target, propertyKey);
    }
  }

  static hasMetadata(metadataKey: any, target: Object, propertyKey?: string | symbol):boolean {
    if (!propertyKey) {
      return Reflect.hasMetadata(metadataKey, target);
    } else {
      return Reflect.hasMetadata(metadataKey, target, propertyKey);
    }
  }

  static defineInsertEndArrayMetadata(key: any, metadata: any[], target: Object, propertyKey?: string | symbol):void {
    const previousValue:[] = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, ...metadata];
    Metadata.defineMetadata(key, value, target, propertyKey);
  }

  static defineInsertBeginArrayMetadata(key: any, metadata: any[], target: Object, propertyKey?: string | symbol):void {
    const previousValue:[] = Reflect.getMetadata(key, target) || [];
    const value = [...metadata, ...previousValue];
    Metadata.defineMetadata(key, value, target, propertyKey);
  }

  static defineMergeObjectMetadata(key: any, metadata: any,target: any, propertyKey?: string | symbol):void {
    const previousValue:any = Reflect.getMetadata(key, target);

    if (typeof previousValue === 'object' && typeof metadata === 'object') {
      const mergeConfig:any = extend(true, {}, previousValue, metadata);
      Metadata.defineMetadata(key, mergeConfig, target, propertyKey);
      return;
    }

    Metadata.defineMetadata(key, metadata, target, propertyKey);
  }

  static decorate(decorators: ClassDecorator[], target: Function) {
    Reflect.decorate(decorators, target);
  }
}
