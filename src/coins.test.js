//
// Copyright 2019 Wireline, Inc.
//

import { Registry, DEFAULT_CHAIN_ID } from './index';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
const WIRE_WNS_ENDPOINT = process.env.WIRE_WNS_ENDPOINT || 'http://localhost:9473/api';
const WIRE_WNS_CHAIN_ID = process.env.WIRE_WNS_CHAIN_ID || DEFAULT_CHAIN_ID;

describe('coins', () => {
  let registry;

  beforeAll(async () => {
    registry = new Registry(WIRE_WNS_ENDPOINT, WIRE_WNS_CHAIN_ID);
  });

  test.skip('send', async () => {
    await registry.sendCoins([{ denom: 'wire', amount: '100' }], 'cosmos1w5q7xy9sk8hqvlklftdfdkc3kgsd90cxlkwvty', PRIVATE_KEY);
  });
});
