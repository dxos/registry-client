//
// Copyright 2019 Wireline, Inc.
//

import graphviz from 'graphviz';

import records from './mock/data/records';
import { Util } from './util';

const COLOR_MAP = {
  'wrn:protocol': 'red',
  'wrn:bot': 'blue',
  'wrn:pad': 'green'
};

test('graph', async () => {
  const g = graphviz.digraph('G');

  const recordsById = {};
  await Promise.all(records.map(async (record) => {
    recordsById[(await Util.getContentId(record))] = record;
  }));

  /* eslint-disable no-restricted-syntax */
  for (const [, record] of Object.entries(recordsById)) {
    const wrn = `${record.type}:${record.name}#${record.version}`;
    g.addNode(wrn, { color: COLOR_MAP[record.type] });
    for (const [, propValue] of Object.entries(record)) {
      if (typeof (propValue) === 'object' && propValue.type === 'wrn:reference') {
        const refRecord = recordsById[propValue.id];
        const refWrn = `${refRecord.type}:${refRecord.name}#${refRecord.version}`;
        g.addEdge(wrn, refWrn, {});
      }
    }
  }

  g.output('png', 'graph.png');
});
