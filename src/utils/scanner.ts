/* eslint-disable @typescript-eslint/ban-types */
import { IScanNode, IScanContext } from "../interfaces";
import {
  ParentMetadata,
  ScanPriorityMetadata,
  ScanPrioritySortCompareMetadata,
  NameMetadata,
  HookMetadata,
} from '../metadata';

import * as hookUtil from './hookUtil';

/** @ignore */
let instanceNameId = 0;

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
  inputs?: Record<string, unknown>,
  contextScanHook?: hookUtil.HookFunction,
  scanNodeScanHook?: hookUtil.HookFunction
}

/**
 * scan the provider with hooks
 *
 * @param provider the provider for scan context.
 */
export async function scan(provider:object, options?:ScanOptions): Promise<IScanContext> {
  const context: IScanContext = {};
  // set from the inputs.
  if (options?.inputs) {
    Object.entries(options?.inputs).forEach(([key, value]) => {
      context[key] = value;
    });
  }
  const rootScanNode:IScanNode = createScanNode(provider, context, null);
  context.rootScanNode = rootScanNode;
  const selfHooks = hookUtil.ensureHooks(options?.contextScanHook || null);
  const childrenHook = hookUtil.traverseScanNodeHook(
    rootScanNode,
    (scanNode: IScanNode): hookUtil.HookFunction[] => {
      return [
        options?.scanNodeScanHook || hookUtil.noopHook,
      ...HookMetadata.getMetadata(scanNode.provider)
      ]
    }, hookUtil.nestHooks);

  await hookUtil.nestHooks([
    ...selfHooks,
    childrenHook,
  ])(context);

  return context;
}
