import { ScanPriorityMetadata, defaultPrioritySortCompare } from './ScanPriorityMetadata';
import { IScanNode } from '../interfaces/IScanNode';

function createScanNode(priority: number):IScanNode {
  return {
    context: {},
    provider: {},
    children: [],
    parent: null,
    priority,
    name: '',
    namePaths: []
  }
}

describe('decorators: ScanPriority', () => {
  it('should ScanPriority decorator has correctly value', () => {
      const A = {};
      ScanPriorityMetadata.defineMetadata(A, 3);
      expect(ScanPriorityMetadata.getMetadata(A)).toEqual(3);

    const B = {};
    ScanPriorityMetadata.defineMetadata(B, 3);
    ScanPriorityMetadata.defineMetadata(B, 2);
    expect(ScanPriorityMetadata.getMetadata(B)).toEqual(2);

    const C = {};
    ScanPriorityMetadata.defineMetadata(C, 3);
    ScanPriorityMetadata.defineMetadata(C, 2);
    ScanPriorityMetadata.defineMetadata(C, -1);
    expect(ScanPriorityMetadata.getMetadata(C)).toEqual(-1);
  })

  it('should higher priority number means higher priority ', () => {
    let scanNodes:IScanNode[] = [
      createScanNode(1),
      createScanNode(5),
      createScanNode(2),
      createScanNode(3),
      createScanNode(-1),
    ];
    scanNodes.sort(defaultPrioritySortCompare);

    const priorities = scanNodes.map((item: IScanNode) => {
      return item.priority;
    })

    expect(priorities).toEqual([5,3,2,1,-1]);
  })
})
