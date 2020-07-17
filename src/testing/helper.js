//
// Copyright 2019 Wireline, Inc.
//

import yaml from 'node-yaml';
import semver from 'semver';

// Fake bond ID used for in-mem tests.
const FAKE_BOND_ID = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';

const DEFAULT_PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';

export const ensureUpdatedConfig = async path => {
  const conf = await yaml.read(path);
  conf.record.version = semver.inc(conf.record.version, 'patch');
  await yaml.write(path, conf);

  return conf;
};

export const getBaseConfig = async path => {
  const conf = await yaml.read(path);
  conf.record.version = '0.0.1';

  return conf;
};

/**
 * Provision a bond for record registration.
 * @param {object} registry
 * @param {string} privateKey
 * @param {boolean} mock
 */
export const provisionBondId = async (registry, privateKey, mock) => {
  if (mock) {
    return FAKE_BOND_ID;
  }

  let bonds = await registry.queryBonds();
  if (!bonds.length) {
    await registry.createBond([{ denom: 'uwire', amount: '1000000000' }], privateKey);
    bonds = await registry.queryBonds();
  }

  return bonds[0].id;
};

export const getConfig = () => ({
  mockServer: process.env.MOCK_SERVER || false,
  wns: {
    chainId: process.env.WIRE_WNS_CHAIN_ID || 'wireline',
    privateKey: DEFAULT_PRIVATE_KEY,
    endpoint: process.env.WIRE_WNS_ENDPOINT || 'http://localhost:9473/api',
    fee: {
      amount: [
        {
          amount: '200000',
          denom: 'uwire'
        }
      ],
      gas: '200000'
    }
  }
});
