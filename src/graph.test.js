//
// Copyright 2020 DXOS.org
//

import graphviz from 'graphviz';

import records from './mock/data/records.json';
import { Util } from './util';

const COLOR_MAP = {
  'dxn:protocol': 'red',
  'dxn:bot': 'blue',
  'dxn:pad': 'green'
};

test.skip('graph', async () => {
  const g = graphviz.digraph('G');

  const recordsById = {};
  await Promise.all(records.map(async (record) => {
    recordsById[(await Util.getContentId(record))] = record;
  }));

  /* eslint-disable no-restricted-syntax */
  for (const [, record] of Object.entries(recordsById)) {
    const dxn = `${record.type}:${record.name}#${record.version}`;
    g.addNode(dxn, { color: COLOR_MAP[record.type] });
    for (const [, propValue] of Object.entries(record)) {
      if (typeof (propValue) === 'object' && propValue.type === 'dxn:reference') {
        const refRecord = recordsById[propValue.id];
        const refDxn = `${refRecord.type}:${refRecord.name}#${refRecord.version}`;
        g.addEdge(dxn, refDxn, {});
      }
    }
  }

  g.output('png', 'graph.png');
});
