import { IScanNode } from "../interfaces";

export type HookFunction = (context: any, next?: any) => Promise<any|void>;
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
export async function noopHook(context: any, next?: Function) {
  !!next && await next(context);
}

/**
 * nesting the hooks
 *
 * @category utils
 */
export function nestHooks(hooks: HookFunction | HookFunction[] | null):HookFunction {
  const validHooks:Function[] = ensureHooks(hooks);

  return function (context: any, next?:Function):Promise<any> {
    let index:number = -1;
    function dispatch (i:any): Promise<any> {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn:Function | undefined = validHooks[i];
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

export function nestReversedHooks(hooks: HookFunction | HookFunction[] | null) {
  return nestHooks(ensureHooks(hooks).reverse());
}

/**
 * sequencing the hooks
 *
 * @category utils
 */
export function sequenceHooks(hooks: HookFunction | HookFunction[] | null):HookFunction {
  const validHooks:HookFunction[] = ensureHooks(hooks);
  return async function (context: any, next?:Function):Promise<any> {
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
  const validHooks:Function[] = ensureHooks(hooks);
  return async function (context: any, next?:Function):Promise<any> {
    await Promise.all(validHooks.map((hook: Function) => {
      return Promise.resolve(hook(context, noopHook));
    }))
    !!next && await next(context);
  }
}

export function parallelReversedHooks(hooks: HookFunction | HookFunction[] | null) {
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
export function bindHookContext(targetContext: any, hook: HookFunction): HookFunction {
  return async function (context: any, next?:Function):Promise<any> {
    await hook(targetContext);
    !!next && await next(context);
  }
}

export function conditionHook(
  condition: (context: any) => boolean,
  hook: HookFunction): HookFunction {
  return async function (context: any, next?:Function):Promise<any> {
    if (!condition(context)) {
      return next && await next();
    }

    return await hook(context, next);
  }
}




