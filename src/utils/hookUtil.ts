/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { ScanNode } from '../interfaces';

export type HookFunctionFactory = (
  context: any,
) => HookFunction | HookFunction[] | null;
export type HookFunction = (
  context: any,
  next: CallableFunction,
) => Promise<unknown>;
export type ComposeHooksFunction = (
  hooks: HookFunction | HookFunction[] | null,
) => HookFunction;
export type ConditionFunction = (context: any) => boolean;

/** @ignore */
export function ensureHooks(
  hooks: HookFunction | HookFunction[] | null,
): HookFunction[] {
  if (!hooks) return [];

  if (Array.isArray(hooks)) {
    return hooks as HookFunction[];
  } else if (typeof hooks === 'function') {
    return [hooks];
  }

  return [];
}

/** @ignore */
export const noopHook: HookFunction = async (
  _,
  next: CallableFunction,
): Promise<void> => {
  await next();
};

/** @ignore */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noopNext = () => {};

/**
 * nesting the hooks
 *
 * @category utils
 */
export const nestHooks: ComposeHooksFunction = (
  hooks: HookFunction | HookFunction[] | null,
): HookFunction => {
  const validHooks: CallableFunction[] = ensureHooks(hooks);

  return function (context: any, next: CallableFunction): Promise<unknown> {
    let index = -1;
    function dispatch(i: number): Promise<unknown> {
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn: CallableFunction | undefined = validHooks[i];
      if (i === validHooks.length) fn = next;

      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
};

export const nestReversedHooks: ComposeHooksFunction = (
  hooks: HookFunction | HookFunction[] | null,
): HookFunction => {
  return nestHooks(ensureHooks(hooks).reverse());
};

/**
 * sequencing the hooks
 *
 * @category utils
 */
export const sequenceHooks: ComposeHooksFunction = (
  hooks: HookFunction | HookFunction[] | null,
): HookFunction => {
  const validHooks: HookFunction[] = ensureHooks(hooks);
  return async (context: any, next: CallableFunction): Promise<void> => {
    for (const hook of validHooks) {
      await hook(context, noopNext);
    }
    await next();
  };
};

export const sequenceReversedHooks: ComposeHooksFunction = (
  hooks: HookFunction | HookFunction[] | null,
): HookFunction => {
  return sequenceHooks(ensureHooks(hooks).reverse());
};

/**
 * parallel the hooks
 *
 * @category utils
 */
export const parallelHooks: ComposeHooksFunction = (
  hooks: HookFunction | HookFunction[] | null,
): HookFunction => {
  const validHooks: CallableFunction[] = ensureHooks(hooks);
  return async function (context: any, next: CallableFunction): Promise<void> {
    await Promise.all(
      validHooks.map(async (hook: CallableFunction) => {
        await hook(context, noopNext);
      }),
    );
    await next();
  };
};

export const parallelReversedHooks: ComposeHooksFunction = (
  hooks: HookFunction | HookFunction[] | null,
): HookFunction => {
  return sequenceHooks(ensureHooks(hooks).reverse());
};

export function traverseScanNodeHook(
  scanNode: ScanNode,
  factory: HookFunctionFactory,
  composeHooksFunction: ComposeHooksFunction,
): HookFunction {
  const childrenHook: HookFunction = sequenceHooks(
    scanNode.children.map(
      (childScanNode: ScanNode): HookFunction => {
        return traverseScanNodeHook(
          childScanNode,
          factory,
          composeHooksFunction,
        );
      },
    ),
  );

  const selfHooks: HookFunction[] = ensureHooks(factory(scanNode) || null);
  return bindHookContext(
    scanNode,
    composeHooksFunction([...selfHooks, childrenHook]),
  );
}

export function traceTreeNodeHook(
  scanNode: ScanNode,
  factory: HookFunctionFactory,
  composeHooksFunction: ComposeHooksFunction,
): HookFunction {
  const selfHooks: HookFunction[] = ensureHooks(
    (factory && factory(scanNode)) || null,
  );
  const parentHook: HookFunction = scanNode.parent
    ? traceTreeNodeHook(scanNode.parent, factory, composeHooksFunction)
    : noopHook;
  return bindHookContext(
    scanNode,
    composeHooksFunction([...selfHooks, parentHook]),
  );
}

/**
 * change the hooks context
 *
 * @category utils
 */
export function bindHookContext(
  targetContext: any,
  hook: HookFunction,
): HookFunction {
  return async function (context: any, next: CallableFunction): Promise<void> {
    await hook(targetContext, noopNext);
    await next(context, noopNext);
  };
}

export function conditionHook(
  condition: ConditionFunction,
  hook: HookFunction,
): HookFunction {
  return async function (context: any, next: CallableFunction): Promise<void> {
    if (!condition(context)) {
      await next();
      return;
    }
    await hook(context, next);
  };
}
