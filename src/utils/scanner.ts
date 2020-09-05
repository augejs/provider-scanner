import { IScanNode, IScanContext } from "../interfaces";
import {
  ParentMetadata,
  HookMetadata,
  ScanPriorityMetadata,
  ScanPrioritySortCompareMetadata,
  NameMetadata,
  ChildrenHooksCompositeFunctionMetadata
} from '../metadata';
import * as hookUtil from './hookUtil';

/** @ignore */
let instanceNameId:number = 0;

/** @ignore */
function createScanNode(provider:object, context:IScanContext, parent:IScanNode | null): IScanNode {
  const name:string = NameMetadata.getMetadata(provider) || `anonymous-${++instanceNameId}`;
  const children:IScanNode[] = [];
  const scanNode:IScanNode = {
    context,
    provider,
    inputs: new Map<any, any>(),
    outputs: new Map<any, any>(),
    timeCost: 0,
    children,
    parent,
    priority: ScanPriorityMetadata.getMetadata(provider),
    name,
    namePaths: NameMetadata.concatArrayNamePath(name, parent?.namePaths || null),
  }

  for (const childProvider of ParentMetadata.getMetadata(provider)) {
    children.push(createScanNode(childProvider, context, scanNode));
  }

  children.sort(ScanPrioritySortCompareMetadata.getMetadata(provider));
  return scanNode;
}

/** @ignore */
function buildScanNodeHook(scanNode:IScanNode, scanNodeHook: Function):Function {
  const measureHook:Function = async (context: IScanNode, next: Function) => {
    const now = new Date().getTime();
    await next();
    context.timeCost = new Date().getTime() - now;
  }

  const selfHook:Function = hookUtil.nestHooks(HookMetadata.getMetadata(scanNode.provider));
  const childrenHook:Function = ChildrenHooksCompositeFunctionMetadata.getMetadata(scanNode.provider)(
    scanNode.children.map((childScanNode:IScanNode):Function => {
      return buildScanNodeHook(childScanNode, scanNodeHook);
    })
  );

  return hookUtil.bindHookContext(scanNode,
    hookUtil.nestHooks([
      measureHook,
      scanNodeHook,
      selfHook,
      childrenHook,
    ])
  );
}

/**
 * start the scan process for the provider
 *
 * @param inputs  the input for scan context.
 * @param scanContextHook  the scanContextHook for scan context.
 * @param scanNodeHook  the scanNodeHook for each scan node.
 *
 * @category utils
 */
type ScanOptions = {
  inputs?: Map<any, any>,
  scanContextHook?: Function,
  scanNodeHook?: Function
}

/**
 * scan the provider with hooks
 *
 * @param provider the provider for scan context.
 */
export async function scan(provider:object, options?:ScanOptions):Promise<IScanContext> {
  const context:IScanContext = {
    inputs: options?.inputs || new Map<any, any>(),
    outputs: new Map<any, any>(),
    timeCost: 0,
    rootScanNode: null,
  };

  const rootScanNode:IScanNode = createScanNode(provider, context, null);
  context.rootScanNode = rootScanNode;

  const measureHook:Function = async (context: IScanContext, next: Function) => {
    const now = new Date().getTime();
    await next();
    context.timeCost = new Date().getTime() - now;
  }

  const selfHook:Function = options?.scanContextHook || hookUtil.noopHook;
  const childrenHook:Function = buildScanNodeHook(rootScanNode, options?.scanNodeHook || hookUtil.noopHook);

  await hookUtil.nestHooks([
    measureHook,
    selfHook,
    childrenHook,
  ])(context);

  return context;
}
