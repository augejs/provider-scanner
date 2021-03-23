/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata';
import extend from 'extend';

export class Metadata {
  static defineMetadata (metadataKey:unknown, metadataValue:unknown, target: object, propertyKey?: string | symbol):void {
    if (propertyKey === undefined) {
      Reflect.defineMetadata(metadataKey, metadataValue, target);
    } else {
      Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
    }
  }

  static getMetadata (metadataKey: unknown, target: object, propertyKey?: string | symbol):unknown {
    if (propertyKey === undefined) {
      return Reflect.getMetadata(metadataKey, target);
    } else {
      return Reflect.getMetadata(metadataKey, target, propertyKey);
    }
  }

  static hasMetadata(metadataKey: unknown, target: object, propertyKey?: string | symbol):boolean {
    if (propertyKey === undefined) {
      return Reflect.hasMetadata(metadataKey, target);
    } else {
      return Reflect.hasMetadata(metadataKey, target, propertyKey);
    }
  }

  static defineInsertEndArrayMetadata(key: unknown, metadata: unknown[], target: object, propertyKey?: string | symbol):void {
    if (metadata.length === 0) return;

    const previousValue = Metadata.getMetadata(key, target, propertyKey) as unknown[] || [];
    if (previousValue.length > 0) {
      metadata = metadata.filter(item => {
        return !previousValue.includes(item);
      })
    }

    const value = [...previousValue, ...metadata];
    Metadata.defineMetadata(key, value, target, propertyKey);
  }

  static defineInsertBeginArrayMetadata(key: unknown, metadata: unknown[], target: object, propertyKey?: string | symbol):void {
    if (metadata.length === 0) return;
    const previousValue: unknown[] = Metadata.getMetadata(key, target, propertyKey) as unknown[] || [];

    if (previousValue.length > 0) {
      metadata = metadata.filter(item => {
        return !previousValue.includes(item);
      })
    }

    const value = [...metadata, ...previousValue];
    Metadata.defineMetadata(key, value, target, propertyKey);
  }

  static defineMergeObjectMetadata(key: unknown, metadata: unknown, target: object, propertyKey?: string | symbol):void {
    const previousValue = Metadata.getMetadata(key, target, propertyKey);

    if (typeof previousValue === 'object' && typeof metadata === 'object') {
      const mergeConfig:unknown = extend(true, {}, previousValue, metadata);
      Metadata.defineMetadata(key, mergeConfig, target, propertyKey);
      return;
    }

    Metadata.defineMetadata(key, metadata, target, propertyKey);
  }

  static  decorate(decorators: ClassDecorator[], target: Function): Function {
    return Reflect.decorate(decorators, target);
  }
}
