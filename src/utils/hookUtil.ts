/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { IScanNode } from "../interfaces";

export type HookFunction = (context: any, next?: CallableFunction) => Promise<unknown>;
export type ComposeHooksFunction = (hooks: HookFunction | HookFunction[] | null) => HookFunction;

/** @ignore */
export function ensureHooks(hooks: HookFunction | HookFunction[] | null):HookFunction[] {
  if (!hooks) return [];

  if (Array.isArray(hooks)) {
    return hooks as HookFunction[];
  } else if (typeof hooks === 'function') {
    return [ hooks ];
  }

  return [];
}

/** @ignore */
export async function noopHook(context: any, next?: CallableFunction):Promise<void> {
  !!next && await next(context);
}

/**
 * nesting the hooks
 *
 * @category utils
 */
export function nestHooks(hooks: HookFunction | HookFunction[] | null):HookFunction {
  const validHooks:CallableFunction[] = ensureHooks(hooks);

  return function (context: unknown, next?:CallableFunction):Promise<unknown> {
    let index = -1;
    function dispatch (i:number): Promise<unknown> {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn:CallableFunction | undefined = validHooks[i];
      if (i === validHooks.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0);
  }
}

export function nestReversedHooks(hooks: HookFunction | HookFunction[] | null): HookFunction {
  return nestHooks(ensureHooks(hooks).reverse());
}

/**
 * sequencing the hooks
 *
 * @category utils
 */
export function sequenceHooks(hooks: HookFunction | HookFunction[] | null):HookFunction {
  const validHooks:HookFunction[] = ensureHooks(hooks);
  return async function (context: unknown, next?:CallableFunction):Promise<void> {
    for(const hook of validHooks) {
      await hook(context, noopHook);
    }
    !!next && await next(context);
  }
}

export function sequenceReversedHooks(hooks: HookFunction | HookFunction[] | null): HookFunction {
  return sequenceHooks(ensureHooks(hooks).reverse());
}

/**
 * parallel the hooks
 *
 * @category utils
 */
export function parallelHooks(hooks: HookFunction | HookFunction[] | null): HookFunction {
  const validHooks:CallableFunction[] = ensureHooks(hooks);
  return async function (context: unknown, next?:CallableFunction):Promise<void> {
    await Promise.all(validHooks.map((hook: CallableFunction) => {
      return Promise.resolve(hook(context, noopHook));
    }))
    !!next && await next(context);
  }
}

export function parallelReversedHooks(hooks: HookFunction | HookFunction[] | null): HookFunction {
  return sequenceHooks(ensureHooks(hooks).reverse());
}

export function traverseScanNodeHook(
  scanNode: IScanNode,
  factory: (scanNode: IScanNode) => HookFunction | HookFunction[] | null,
  composeHooksFunction: ComposeHooksFunction):HookFunction {
  const childrenHook: HookFunction = sequenceHooks(
    scanNode.children.map((childScanNode:IScanNode):HookFunction => {
      return traverseScanNodeHook(childScanNode, factory, composeHooksFunction);
  }));

  const selfHooks: HookFunction[] = ensureHooks(factory(scanNode) || null);
  return bindHookContext(scanNode,
    composeHooksFunction([
      ...selfHooks,
      childrenHook,
    ])
  );
}

export function traceTreeNodeHook(
  scanNode: IScanNode,
  factory: (scanNode: IScanNode) => HookFunction | HookFunction[] | null,
  composeHooksFunction: ComposeHooksFunction): HookFunction {
  const selfHooks: HookFunction[] = ensureHooks(factory && factory(scanNode) || null);
  const parentHook: HookFunction = scanNode.parent ? traceTreeNodeHook(scanNode.parent, factory, composeHooksFunction) : noopHook;
  return bindHookContext(scanNode,
    composeHooksFunction([
      ...selfHooks,
      parentHook,
    ])
  );
}

/**
 * change the hooks context
 *
 * @category utils
 */
export function bindHookContext(targetContext: unknown, hook: HookFunction): HookFunction {
  return async function (context: unknown, next?:CallableFunction):Promise<void> {
    await hook(targetContext);
    !!next && await next(context);
  }
}

export function conditionHook(
  condition: (context: any) => boolean,
  hook: HookFunction): HookFunction {
  return async function (context: any, next?:CallableFunction):Promise<unknown> {
    if (!condition(context)) {
      return next && await next();
    }

    return await hook(context, next);
  }
}
