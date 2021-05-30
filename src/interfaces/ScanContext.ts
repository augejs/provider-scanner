import { ScanNode } from './ScanNode';

/**
 * ScanContext
 *
 * @category interface
 */
export interface ScanContext {
  /**
   * the root scan node
   */
  rootScanNode?: ScanNode;

  [prop: string]: unknown;
}
