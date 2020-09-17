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
  context: IScanContext,
  /**
   * the provider of scan node
   */
  provider: object,

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
  name: string,
  /**
  * @ignore
  */
  namePaths: string[], //[name, name, name]
  // namePath is the unique name path of scanNode

  [prop: string]: any
}
