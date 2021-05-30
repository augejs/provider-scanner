/* eslint-disable @typescript-eslint/ban-types */
import { ScanContext } from './ScanContext';

/**
 * ScanNode
 *
 * @category interface
 */
export interface ScanNode {
  /**
   * the context of scan node
   */
  context: ScanContext;
  /**
   * the provider of scan node
   */
  provider: object;

  /**
   * the children scan nodes of current scan node
   */
  children: ScanNode[];
  /**
   * the parent scan node of current scan node
   */
  parent: ScanNode | null;
  /**
   * the sort priority of current scan node
   */
  priority: number;
  /**
   * the name  of current scan node
   */
  name: string;
  /**
   * @ignore
   */
  /**
   * namePath is the unique name path of scanNode
   */
  namePaths: string[]; //[name, name, name]

  [prop: string]: unknown;
}
