//
// Copyright 2019 Wireline, Inc.
//

import { Registry } from './index';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
const WIRE_WNS_ENDPOINT = process.env.WIRE_WNS_ENDPOINT || 'http://localhost:9473/api';

describe('coins', () => {
  let registry;

  beforeAll(async () => {
    registry = new Registry(WIRE_WNS_ENDPOINT);
  });

  test.skip('send', async () => {
    await registry.sendCoins([{ denom: 'wire', amount: '100' }], 'cosmos1w5q7xy9sk8hqvlklftdfdkc3kgsd90cxlkwvty', PRIVATE_KEY);
  });
});
