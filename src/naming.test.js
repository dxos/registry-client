//
// Copyright 2019 Wireline, Inc.
//

import path from 'path';

import { Registry } from './index';
import { getConfig, ensureUpdatedConfig } from './testing/helper';

const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');

jest.setTimeout(90 * 1000);

const { mockServer, wns: { chainId, endpoint, privateKey, fee } } = getConfig();

const namingTests = () => {
  let registry;

  let bot;

  let bondId;

  const publishNewBotVersion = async (bondId) => {
    bot = await ensureUpdatedConfig(BOT_YML_PATH);
    await registry.setRecord(privateKey, bot.record, privateKey, bondId, fee);
    return bot.record;
  };

  beforeAll(async () => {
    registry = new Registry(endpoint, chainId);
    bondId = await registry.getNextBondId(privateKey);
    await registry.createBond([{ denom: 'uwire', amount: '1000000000' }], privateKey, fee);
    await publishNewBotVersion(bondId);
  });

  test('Reserve authority.', async () => {

  });
};

if (mockServer) {
  // Required as jest complains if file has no tests.
  test('skipping naming tests', () => {});
} else {
  describe('Naming', namingTests);
}
