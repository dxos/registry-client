//
// Copyright 2019 Wireline, Inc.
//

import path from 'path';

import { Registry, Account } from './index';
import { getConfig, ensureUpdatedConfig } from './testing/helper';

const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');

jest.setTimeout(120 * 1000);

const { mockServer, wns: { chainId, endpoint, privateKey, fee } } = getConfig();

const namingTests = () => {
  let registry;

  let bondId;
  let bot;
  let botId;

  let authorityName;
  let otherAuthorityName;
  let otherPrivateKey;

  let wrn;

  beforeAll(async () => {
    registry = new Registry(endpoint, chainId);

    // Create bond.
    bondId = await registry.getNextBondId(privateKey);
    await registry.createBond([{ denom: 'uwire', amount: '1000000000' }], privateKey, fee);

    // Create bot.
    bot = await ensureUpdatedConfig(BOT_YML_PATH);
    const result = await registry.setRecord(privateKey, bot.record, privateKey, bondId, fee);
    botId = result.data;
  });

  test('Reserve authority.', async () => {
    authorityName = `dxos-${Date.now()}`;
    await registry.reserveAuthority(authorityName, privateKey, fee);
  });

  test('Lookup authority.', async () => {
    const result = await registry.lookupAuthorities([authorityName]);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);

    const [record] = result.records;
    expect(record.ownerAddress).toBeDefined();
    expect(record.ownerPublicKey).toBeDefined();
    expect(record.height).toBeDefined();
  });

  test('Lookup non existing authority', async () => {
    const result = await registry.lookupAuthorities(['does-not-exist']);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);

    const [record] = result.records;
    expect(record).toBeNull();
  });

  test('Reserve already reserved authority', async () => {
    await expect(registry.reserveAuthority(authorityName, privateKey, fee)).rejects.toThrow('Name already exists.');
  });

  test('Set name', async () => {
    wrn = `wrn://${authorityName}/app/test`;
    await registry.setName(wrn, botId, privateKey, fee);

    // Query records should return it (some WRN points to it).
    const records = await registry.queryRecords({ type: 'bot', version: bot.record.version });
    expect(records).toBeDefined();
    expect(records).toHaveLength(1);
  });

  test('Lookup name', async () => {
    const result = await registry.lookupNames([wrn]);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);

    const [record] = result.records;
    const { latest, history } = record;
    expect(latest).toBeDefined();
    expect(latest.id).toBeDefined();
    expect(latest.id).toBe(botId);
    expect(latest.height).toBeDefined();
    expect(history).toBeUndefined();
  });

  test('Resolve name', async () => {
    const result = await registry.resolveNames([wrn]);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);

    const [record] = result.records;
    expect(record.attributes).toEqual(bot.record);
  });

  test('Lookup name with history', async () => {
    const updatedBot = await ensureUpdatedConfig(BOT_YML_PATH);
    let result = await registry.setRecord(privateKey, updatedBot.record, privateKey, bondId, fee);
    const updatedBotId = result.data;
    await registry.setName(wrn, updatedBotId, privateKey, fee);

    result = await registry.lookupNames([wrn], true);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);

    const [record] = result.records;
    const { latest, history } = record;
    expect(latest).toBeDefined();
    expect(latest.id).toBeDefined();
    expect(latest.id).toBe(updatedBotId);
    expect(latest.height).toBeDefined();
    expect(history).toBeDefined();
    expect(history).toHaveLength(1);

    const [oldRecord] = history;
    expect(oldRecord).toBeDefined();
    expect(oldRecord.id).toBeDefined();
    expect(oldRecord.id).toBe(botId);
    expect(oldRecord.height).toBeDefined();
  });

  test('Set name without reserving authority', async () => {
    await expect(registry.setName('wrn://not-reserved/app/test', botId, privateKey, fee)).rejects.toThrow('Name authority not found.');
  });

  test('Set name for non-owned authority', async () => {
    // Create another account.
    const mnenonic = Account.generateMnemonic();
    const otherAccount = Account.generateFromMnemonic(mnenonic);
    await registry.sendCoins([{ denom: 'uwire', amount: '1000000000' }], otherAccount.formattedCosmosAddress, privateKey, fee);

    // Other account reserves an authority.
    otherAuthorityName = `other-${Date.now()}`;
    otherPrivateKey = otherAccount.privateKey.toString('hex');
    await registry.reserveAuthority(otherAuthorityName, otherPrivateKey, fee);

    // Try setting name under other authority.
    await expect(registry.setName(`wrn://${otherAuthorityName}/app/test`, botId, privateKey, fee)).rejects.toThrow('Access denied.');
  });

  test('Lookup non existing name', async () => {
    const result = await registry.lookupNames(['wrn://not-reserved/app/test']);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);
    const [record] = result.records;
    expect(record).toBeNull();
  });

  test('Resolve non existing name', async () => {
    const result = await registry.resolveNames(['wrn://not-reserved/app/test']);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);
    const [record] = result.records;
    expect(record).toBeNull();
  });

  test('Delete name', async () => {
    await registry.deleteName(wrn, privateKey, fee);

    const result = await registry.lookupNames([wrn], true);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);

    const [record] = result.records;
    const { latest } = record;
    expect(latest).toBeDefined();
    expect(latest.id).toBeDefined();
    expect(latest.id).toBe('');
    expect(latest.height).toBeDefined();

    // Query records should NOT return it (no WRN points to it).
    let records = await registry.queryRecords({ type: 'bot', version: bot.record.version });
    expect(records).toBeDefined();
    expect(records).toHaveLength(0);

    // Query all records should return it (all: true).
    records = await registry.queryRecords({ type: 'bot', version: bot.record.version }, true);
    expect(records).toBeDefined();
    expect(records).toHaveLength(1);
  });

  test('Delete already deleted name', async () => {
    await registry.deleteName(wrn, privateKey, fee);

    const result = await registry.lookupNames([wrn], true);
    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.height).toBeDefined();
    expect(result.records).toBeDefined();
    expect(result.records).toHaveLength(1);

    const [record] = result.records;
    const { latest } = record;
    expect(latest).toBeDefined();
    expect(latest.id).toBeDefined();
    expect(latest.id).toBe('');
    expect(latest.height).toBeDefined();
  });

  test('Delete name for non-owned authority.', async () => {
    await registry.setName(`wrn://${otherAuthorityName}/app/test`, botId, otherPrivateKey, fee);

    // Try deleting name under other authority.
    await expect(registry.deleteName(`wrn://${otherAuthorityName}/app/test`, privateKey, fee)).rejects.toThrow('Access denied.');
  });
};

if (mockServer) {
  // Required as jest complains if file has no tests.
  test('skipping naming tests', () => {});
} else {
  describe('Naming', namingTests);
}
