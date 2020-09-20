import { IScanNode } from "../interfaces";
import { ChildrenHooksCompositeFunctionMetadata, HookMetadata } from "../metadata";

/** @ignore */
export function ensureHooks(hooks: Function | Function[] | null):Function[] {
  if (hooks === null) return [];
  return Array.isArray(hooks) ? (hooks as Function[]) : [ hooks ]
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
export function nestHooks(hooks: Function | Function[] | null):Function {
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

/**
 * sequencing the hooks
 *
 * @category utils
 */
export function sequenceHooks(hooks: Function | Function[] | null):Function {
  const validHooks:Function[] = ensureHooks(hooks);
  return async function (context: any, next?:Function):Promise<any> {
    for(const hook of validHooks) {
      await hook(context, noopHook);
    }
    !!next && await next(context);
  }
}

/**
 * parallel the hooks
 *
 * @category utils
 */
export function parallelHooks(hooks: Function | Function[] | null): Function {
  const validHooks:Function[] = ensureHooks(hooks);
  return async function (context: any, next?:Function):Promise<any> {
    await Promise.all(validHooks.map((hook: Function) => {
      return Promise.resolve(hook(context, noopHook));
    }))
    !!next && await next(context);
  }
}

interface ITreeNode {
  children: ITreeNode[]
}

export function traverseTreeNodeHook(treeNode:ITreeNode, hook: Function):Function {
  const childrenScanHook: Function = sequenceHooks(
    treeNode.children.map((childTreeNode:ITreeNode):Function => {
      return traverseTreeNodeHook(childTreeNode, hook);
    }))

  return bindHookContext(treeNode,
    nestHooks([
      hook,
      childrenScanHook,
    ])
  );
}

export function traverseProviderHook(scanNode:IScanNode, hook: Function):Function {
  const selfHook: Function = nestHooks(
    [
      nestHooks(HookMetadata.getMetadata(scanNode.provider)),
      hook
    ]);

  const childrenHook:Function = ChildrenHooksCompositeFunctionMetadata.getMetadata(scanNode.provider)(
    scanNode.children.map((childScanNode:IScanNode):Function => {
      return traverseProviderHook(childScanNode, hook);
    })
  );

  return bindHookContext(scanNode,
    nestHooks([
      selfHook,
      childrenHook,
    ])
  );
}

/**
 * change the hooks context
 *
 * @category utils
 */
export function bindHookContext(targetContext: any, hook: Function) {
  return async function (context: any, next?:Function):Promise<any> {
    await hook(targetContext);
    !!next && await next(context);
  }
}


