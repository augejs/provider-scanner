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
async function traverseScanNode(scanNode: IScanNode, before?: Function, after?: Function) {
  before && await before(scanNode);
  for (let child of scanNode.children) {
    await traverseScanNode(child, before, after);
  }
  after && await after(scanNode);
}

/** @ignore */
function createScanNode(provider:object, context:IScanContext, parent:IScanNode | null): IScanNode {
  const name:string = NameMetadata.getMetadata(provider) || `anonymous-${++instanceNameId}`;
  const children:IScanNode[] = [];
  const scanNode:IScanNode = {
    context,
    provider,
    children,
    parent,
    priority: ScanPriorityMetadata.getMetadata(provider),
    name,
    namePaths: NameMetadata.concatArrayNamePath(name, parent?.namePaths || null),
    traverse: async function (before?: Function, after?: Function) {
      await traverseScanNode(this, before, after)
    }
  }

  for (const childProvider of ParentMetadata.getMetadata(provider)) {
    children.push(createScanNode(childProvider, context, scanNode));
  }

  children.sort(ScanPrioritySortCompareMetadata.getMetadata(provider));
  return scanNode;
}

/** @ignore */
function buildScanNodeHook(scanNode:IScanNode, scanNodeHook: Function):Function {
  const selfHook: Function = hookUtil.nestHooks(
    [
      hookUtil.nestHooks(HookMetadata.getMetadata(scanNode.provider)),
      scanNodeHook
    ]);

  const childrenHook:Function = ChildrenHooksCompositeFunctionMetadata.getMetadata(scanNode.provider)(
    scanNode.children.map((childScanNode:IScanNode):Function => {
      return buildScanNodeHook(childScanNode, scanNodeHook);
    })
  );

  return hookUtil.bindHookContext(scanNode,
    hookUtil.nestHooks([
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
  inputs?: object,
  scanContextHook?: Function,
  scanNodeHook?: Function
}

/**
 * scan the provider with hooks
 *
 * @param provider the provider for scan context.
 */
export async function scan(provider:object, options?:ScanOptions): Promise<IScanContext> {
  const context: IScanContext = {};

  if (options?.inputs) {
    Object.entries(options?.inputs).forEach(([key, value]) => {
      context[key] = value;
    });
  }
  const rootScanNode:IScanNode = createScanNode(provider, context, null);
  context.rootScanNode = rootScanNode;
  const selfHook: Function =  options?.scanContextHook || hookUtil.noopHook;
  const childrenHook: Function = buildScanNodeHook(rootScanNode, options?.scanNodeHook || hookUtil.noopHook);
  await hookUtil.nestHooks([
    selfHook,
    childrenHook,
  ])(context);

  return context;
}
