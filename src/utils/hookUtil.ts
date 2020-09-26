/** @ignore */
export function ensureHooks(hooks: Function | Function[] | null):Function[] {
  if (!hooks) return [];

  if (Array.isArray(hooks)) {
    return hooks as Function[];
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

export function nestReversedHooks(hooks: Function | Function[] | null) {
  const validHooks:Function[] = ensureHooks(hooks).reverse();
  return nestHooks(validHooks);
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

export function sequenceReversedHooks(hooks: Function | Function[] | null) {
  const validHooks:Function[] = ensureHooks(hooks).reverse();
  return sequenceHooks(validHooks);
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

export function parallelReversedHooks(hooks: Function | Function[] | null) {
  const validHooks:Function[] = ensureHooks(hooks).reverse();
  return sequenceHooks(validHooks);
}

interface ITreeNode {
  parent: ITreeNode | null
  children: ITreeNode[]
}

export function traverseTreeNodeHook(
  treeNode:ITreeNode,
  factory: Function,
  hooksComposite: Function
  ):Function {
  const childrenHook: Function = sequenceHooks(
    treeNode.children.map((childTreeNode:ITreeNode):Function => {
      return traverseTreeNodeHook(childTreeNode, factory, hooksComposite);
  }));

  const selfHooks: Function[] = ensureHooks(factory(treeNode) || null);
  return bindHookContext(treeNode,
    hooksComposite([
      ...selfHooks,
      childrenHook,
    ])
  );
}

export function traceTreeNodeHook(
  treeNode: ITreeNode,
  factory: Function,
  hooksComposite: Function): Function {
  let selfHooks: Function[] = ensureHooks(factory && factory(treeNode) || null);
  const parentHook: Function = treeNode.parent ? traceTreeNodeHook(treeNode.parent, factory, hooksComposite) : noopHook;
  return bindHookContext(treeNode,
    hooksComposite([
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
export function bindHookContext(targetContext: any, hook: Function): Function {
  return async function (context: any, next?:Function):Promise<any> {
    await hook(targetContext);
    !!next && await next(context);
  }
}


