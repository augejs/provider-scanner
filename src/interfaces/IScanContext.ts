import { IScanNode } from './IScanNode';

/**
 * IScanContext
 *
 * @category interface
 */
export interface IScanContext {
  /**
   * the root scan node
   */
  rootScanNode?: IScanNode

  [prop: string]: unknown
}
