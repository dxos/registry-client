//
// Copyright 2019 Wireline, Inc.
//

import { DEFAULT_CHAIN_ID, Registry, createSchema } from './index';

const WIRE_WNS_CHAIN_ID = process.env.WIRE_WNS_CHAIN_ID || DEFAULT_CHAIN_ID;

const data = [
  {
    type: 'wrn:bot',
    name: 'dxos.network/chess',
    version: '1.0.0',
    displayName: 'ChessBot'
  },
  {
    type: 'wrn:bot-factory',
    name: 'dxos.network/demo',
    version: '1.0.0',
    displayName: 'ChessBot',
    topic: '41f4493e5a134f49111d7b681d623ad4a38f4c42fcb67901e7a447ee703a545f'
  }
];

describe('Querying mock schema.', () => {
  let schema;
  let registry;

  beforeAll(async () => {
    schema = await createSchema(data);
    registry = new Registry(undefined, WIRE_WNS_CHAIN_ID, { schema });
  });

  test('List records.', async () => {
    const records = await registry.queryRecords({});
    expect(records[0].type).toBe(data[0].type);
    expect(records[0].name).toBe(data[0].name);
    expect(records[1].type).toBe(data[1].type);
    expect(records[1].name).toBe(data[1].name);
    expect(records[1].attributes.topic).toBe(data[1].topic);
  });
});
