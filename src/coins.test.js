//
// Copyright 2020 DXOS.org
//

import { Registry, DEFAULT_CHAIN_ID } from './index';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
const DX_REGISTRY_ENDPOINT = process.env.DX_REGISTRY_ENDPOINT || 'http://localhost:9473/api';
const DX_REGISTRY_CHAIN_ID = process.env.DX_REGISTRY_CHAIN_ID || DEFAULT_CHAIN_ID;

const FEE = {
  amount: [
    {
      amount: '200000',
      denom: 'uwire'
    }
  ],
  gas: '200000'
};

describe('coins', () => {
  let registry;

  beforeAll(async () => {
    registry = new Registry(DX_REGISTRY_ENDPOINT, DX_REGISTRY_CHAIN_ID);
  });

  test.skip('send', async () => {
    await registry.sendCoins([{ denom: 'wire', amount: '100' }], 'cosmos1w5q7xy9sk8hqvlklftdfdkc3kgsd90cxlkwvty', PRIVATE_KEY, FEE);
  });
});
