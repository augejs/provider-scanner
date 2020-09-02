import { IScanContext } from './IScanContext';

/**
 * IScanNode
 *
 * @category interface
 */
export interface IScanNode {

  /**
   * the context of scan node
   */
  context: IScanContext | null,
  /**
   * the provider of scan node
   */
  provider: object,
  /**
   * the inputs of scan node
   */
  inputs: Map<any, any>,
  /**
   * the outputs of scan node
   */
  outputs: Map<any, any>,
  /**
   * the time cost of scan
   */
  timeCost: number,
  /**
   * the children scan nodes of current scan node
   */
  children: IScanNode[],
  /**
   * the parent scan node of current scan node
   */
  parent: IScanNode | null,
  /**
   * the sort priority of current scan node
   */
  priority:number,
  /**
   * the name  of current scan node
   */
  name: string | null,
  /**
  * @ignore
  */
  namePaths: string[], //[name, name, name]
  // namePath is the unique name path of scanNode
}
