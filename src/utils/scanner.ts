/* eslint-disable @typescript-eslint/ban-types */
import { ScanNode, ScanContext } from '../interfaces';
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
function createScanNode(
  provider: object,
  context: ScanContext,
  parent: ScanNode | null,
): ScanNode {
  const name: string =
    NameMetadata.getMetadata(provider) || `anonymous-${++instanceNameId}`;
  const children: ScanNode[] = [];
  const scanNode: ScanNode = {
    context,
    provider,
    children,
    parent,
    priority: ScanPriorityMetadata.getMetadata(provider),
    name,
    namePaths: NameMetadata.concatArrayNamePath(
      name,
      parent?.namePaths || null,
    ),
  };

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
  inputs?: Record<string, unknown>;
  contextScanHook?: hookUtil.HookFunction;
  scanNodeScanHook?: hookUtil.HookFunction;
};

/**
 * scan the provider with hooks
 *
 * @param provider the provider for scan context.
 */
export async function scan(
  provider: object,
  options?: ScanOptions,
): Promise<ScanContext> {
  const context: ScanContext = {};
  // set from the inputs.
  if (options?.inputs) {
    Object.entries(options?.inputs).forEach(([key, value]) => {
      context[key] = value;
    });
  }
  const rootScanNode: ScanNode = createScanNode(provider, context, null);
  context.rootScanNode = rootScanNode;
  const selfHooks = hookUtil.ensureHooks(options?.contextScanHook || null);
  const childrenHook = hookUtil.traverseScanNodeHook(
    rootScanNode,
    (scanNode: ScanNode): hookUtil.HookFunction[] => {
      return [
        options?.scanNodeScanHook || hookUtil.noopHook,
        ...HookMetadata.getMetadata(scanNode.provider),
      ];
    },
    hookUtil.nestHooks,
  );

  const hook: hookUtil.HookFunction = hookUtil.nestHooks([
    ...selfHooks,
    childrenHook,
  ]);

  await hook(context, hookUtil.noopNext);

  return context;
}
