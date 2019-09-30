//
// Copyright 2019 Wireline, Inc.
//

import yaml from 'node-yaml';

import { Registry } from './index';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';

jest.setTimeout(25000);

describe('Registering', () => {
  let bot;
  let pad;
  let protocol;

  const registry = new Registry('http://localhost:9473/query');

  beforeAll(async () => {
    bot = await yaml.read('./testing/bot.yml');
    pad = await yaml.read('./testing/pad.yml');
    protocol = await yaml.read('./testing/protocol.yml');
  });

  test('Register bot.', async () => {
    await registry.setRecord(PRIVATE_KEY, bot.record, PRIVATE_KEY);
  });

  test('Register pad.', async () => {
    await registry.setRecord(PRIVATE_KEY, pad.record, PRIVATE_KEY);
  });

  test('Register protocol.', async () => {
    await registry.setRecord(PRIVATE_KEY, protocol.record, PRIVATE_KEY);
  });
});
