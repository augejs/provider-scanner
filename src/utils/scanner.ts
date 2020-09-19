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

export function createProviderScanHook(scanNode:IScanNode, scanHook: Function):Function {
  const selfHook: Function = hookUtil.nestHooks(
    [
      hookUtil.nestHooks(HookMetadata.getMetadata(scanNode.provider)),
      scanHook
    ]);

  const childrenHook:Function = ChildrenHooksCompositeFunctionMetadata.getMetadata(scanNode.provider)(
    scanNode.children.map((childScanNode:IScanNode):Function => {
      return createProviderScanHook(childScanNode, scanHook);
    })
  );

  return hookUtil.bindHookContext(scanNode,
    hookUtil.nestHooks([
      selfHook,
      childrenHook,
    ])
  );
}

export function createScanNodeScanHook(scanNode:IScanNode, scanHook: Function):Function {
  const childrenScanHook: Function = hookUtil.sequenceHooks(
    scanNode.children.map((childScanNode:IScanNode):Function => {
      return createScanNodeScanHook(childScanNode, scanHook);
    }))

  return hookUtil.bindHookContext(scanNode,
    hookUtil.nestHooks([
      scanHook,
      childrenScanHook,
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
  contextScanHook?: Function,
  scanNodeScanHook?: Function
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
  const selfHook: Function =  options?.contextScanHook || hookUtil.noopHook;
  const childrenHook: Function = createProviderScanHook(rootScanNode, options?.scanNodeScanHook || hookUtil.noopHook);
  await hookUtil.nestHooks([
    selfHook,
    childrenHook,
  ])(context);

  return context;
}
