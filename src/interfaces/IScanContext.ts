import { IScanNode } from './IScanNode';

/**
 * IScanContext
 *
 * @category interface
 */
export interface IScanContext {
  /**
   * the inputs of scan context
   */
  inputs: Map<any, any>

  /**
   * the outputs of scan context
   */
  outputs: Map<any, any>

  /**
   * the time cost of scan
   */
  timeCost: number

  /**
   * the root scan node
   */
  rootScanNode: IScanNode | null
}
