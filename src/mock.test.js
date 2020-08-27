//
// Copyright 2019 Wireline, Inc.
//

import { DEFAULT_CHAIN_ID, Registry, createSchema } from './index';

const WIRE_WNS_CHAIN_ID = process.env.WIRE_WNS_CHAIN_ID || DEFAULT_CHAIN_ID;

const data = [
  {
    type: 'bot',
    version: '1.0.0',
    name: 'ChessBot'
  },
  {
    type: 'bot-factory',
    version: '1.0.0',
    name: 'ChessBot',
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
    expect(records[0].attributes.type).toBe(data[0].type);
    expect(records[0].attributes.name).toBe(data[0].name);
    expect(records[1].attributes.type).toBe(data[1].type);
    expect(records[1].attributes.name).toBe(data[1].name);
    expect(records[1].attributes.topic).toBe(data[1].topic);
  });
});
