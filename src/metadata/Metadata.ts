/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import 'reflect-metadata';
import extend from 'extend';

export class Metadata {
  static defineMetadata (metadataKey:any, metadataValue:any, target: object, propertyKey?: string | symbol):void {
    if (propertyKey === undefined) {
      Reflect.defineMetadata(metadataKey, metadataValue, target);
    } else {
      Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
    }
  }

  static getMetadata (metadataKey: any, target: object, propertyKey?: string | symbol):unknown {
    if (propertyKey === undefined) {
      return Reflect.getMetadata(metadataKey, target);
    } else {
      return Reflect.getMetadata(metadataKey, target, propertyKey);
    }
  }

  static hasMetadata(metadataKey: any, target: object, propertyKey?: string | symbol):boolean {
    if (propertyKey === undefined) {
      return Reflect.hasMetadata(metadataKey, target);
    } else {
      return Reflect.hasMetadata(metadataKey, target, propertyKey);
    }
  }

  static defineInsertEndArrayMetadata(key: any, metadata: any[], target: object, propertyKey?: string | symbol):void {
    if (metadata.length === 0) return;

    const previousValue = Metadata.getMetadata(key, target, propertyKey) as any[] || [];
    if (previousValue.length > 0) {
      metadata = metadata.filter(item => {
        return !previousValue.includes(item);
      })
    }

    const value = [...previousValue, ...metadata];
    Metadata.defineMetadata(key, value, target, propertyKey);
  }

  static defineInsertBeginArrayMetadata(key: any, metadata: any[], target: object, propertyKey?: string | symbol):void {
    if (metadata.length === 0) return;
    const previousValue: any[] = Metadata.getMetadata(key, target, propertyKey) as any[] || [];

    if (previousValue.length > 0) {
      metadata = metadata.filter(item => {
        return !previousValue.includes(item);
      })
    }

    const value = [...metadata, ...previousValue];
    Metadata.defineMetadata(key, value, target, propertyKey);
  }

  static defineMergeObjectMetadata(key: any, metadata: any, target: object, propertyKey?: string | symbol):void {
    const previousValue = Metadata.getMetadata(key, target, propertyKey);

    if (typeof previousValue === 'object' && typeof metadata === 'object') {
      const mergeConfig:any = extend(true, {}, previousValue, metadata);
      Metadata.defineMetadata(key, mergeConfig, target, propertyKey);
      return;
    }

    Metadata.defineMetadata(key, metadata, target, propertyKey);
  }

  static  decorate(decorators: ClassDecorator[], target: Function): Function {
    return Reflect.decorate(decorators, target);
  }
}
