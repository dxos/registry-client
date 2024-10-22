//
// Copyright 2020 DXOS.org
//

import path from 'path';

import { Registry } from './index';
import { getConfig, ensureUpdatedConfig } from './testing/helper';

const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');

const { mockServer, wns: { chainId, endpoint, privateKey, fee } } = getConfig();

jest.setTimeout(90 * 1000);

const bondTests = () => {
  let registry;

  let bot;

  let version1;
  let version2;

  let bondId1;
  let bondId2;

  let bondOwner;

  const publishNewBotVersion = async (bondId) => {
    bot = await ensureUpdatedConfig(BOT_YML_PATH);
    await registry.setRecord(privateKey, bot.record, privateKey, bondId, fee);
    return bot.record.version;
  };

  beforeAll(async () => {
    registry = new Registry(endpoint, chainId);
  });

  test('Create bond.', async () => {
    bondId1 = await registry.getNextBondId(privateKey);
    expect(bondId1).toBeDefined();
    await registry.createBond([{ denom: 'uwire', amount: '1000000000' }], privateKey, fee);
  });

  test('Get bond by ID.', async () => {
    const [bond] = await registry.getBondsByIds([bondId1]);
    expect(bond).toBeDefined();
    expect(bond.id).toBe(bondId1);
    expect(bond.balance).toHaveLength(1);
    expect(bond.balance[0]).toEqual({ type: 'uwire', quantity: '1000000000' });
    bondOwner = bond.owner;
  });

  test('Query bonds.', async () => {
    const bonds = await registry.queryBonds();
    expect(bonds).toBeDefined();
    const bond = bonds.filter(bond => bond.id === bondId1);
    expect(bond).toBeDefined();
  });

  test('Query bonds by owner.', async () => {
    const bonds = await registry.queryBonds({ owner: bondOwner });
    expect(bonds).toBeDefined();
    const bond = bonds.filter(bond => bond.id === bondId1);
    expect(bond).toBeDefined();
  });

  test('Refill bond.', async () => {
    await registry.refillBond(bondId1, [{ denom: 'uwire', amount: '500' }], privateKey, fee);

    const [bond] = await registry.getBondsByIds([bondId1]);
    expect(bond).toBeDefined();
    expect(bond.id).toBe(bondId1);
    expect(bond.balance).toHaveLength(1);
    expect(bond.balance[0]).toEqual({ type: 'uwire', quantity: '1000000500' });
  });

  test('Withdraw bond.', async () => {
    await registry.withdrawBond(bondId1, [{ denom: 'uwire', amount: '500' }], privateKey, fee);

    const [bond] = await registry.getBondsByIds([bondId1]);
    expect(bond).toBeDefined();
    expect(bond.id).toBe(bondId1);
    expect(bond.balance).toHaveLength(1);
    expect(bond.balance[0]).toEqual({ type: 'uwire', quantity: '1000000000' });
  });

  test('Cancel bond.', async () => {
    await registry.cancelBond(bondId1, privateKey, fee);
    const bonds = await registry.getBondsByIds([bondId1]);
    expect(bonds).toHaveLength(0);
  });

  test('Associate/Dissociate bond.', async () => {
    bondId1 = await registry.getNextBondId(privateKey);
    expect(bondId1).toBeDefined();
    await registry.createBond([{ denom: 'uwire', amount: '1000000000' }], privateKey, fee);

    // Create a new record.
    version1 = await publishNewBotVersion(bondId1);
    let [record1] = await registry.queryRecords({ type: bot.type, name: bot.name, version: version1 }, true);
    expect(record1.bondId).toBe(bondId1);

    // Dissociate record, query and confirm.
    await registry.dissociateBond(record1.id, privateKey, fee);
    [record1] = await registry.queryRecords({ type: bot.type, name: bot.name, version: version1 }, true);
    expect(record1.bondId).toBe('');

    // Associate record with bond, query and confirm.
    await registry.associateBond(record1.id, bondId1, privateKey, fee);
    [record1] = await registry.queryRecords({ type: bot.type, name: bot.name, version: version1 }, true);
    expect(record1.bondId).toBe(bondId1);
  });

  test('Reassociate/Dissociate records.', async () => {
    // Create a new record version.
    version2 = await publishNewBotVersion(bondId1);

    // Check version1, version2 as associated with bondId1.
    let records;
    records = await registry.queryRecords({ type: bot.type, name: bot.name, version: version1 }, true);
    expect(records[0].bondId).toBe(bondId1);
    records = await registry.queryRecords({ type: bot.type, name: bot.name, version: version2 }, true);
    expect(records[0].bondId).toBe(bondId1);

    // Create another bond.
    bondId2 = await registry.getNextBondId(privateKey);
    expect(bondId2).toBeDefined();
    await registry.createBond([{ denom: 'uwire', amount: '1000000000' }], privateKey, fee);
    const [bond] = await registry.getBondsByIds([bondId2]);
    expect(bond.id).toBe(bondId2);

    // Reassociate records from bondId1 to bondId2, verify change.
    await registry.reassociateRecords(bondId1, bondId2, privateKey, fee);
    records = await registry.queryRecords({ type: bot.type, name: bot.name, version: version1 }, true);
    expect(records[0].bondId).toBe(bondId2);
    records = await registry.queryRecords({ type: bot.type, name: bot.name, version: version2 }, true);
    expect(records[0].bondId).toBe(bondId2);

    // Dissociate all records from bond, verify change.
    await registry.dissociateRecords(bondId2, privateKey, fee);
    records = await registry.queryRecords({ type: bot.type, name: bot.name, version: version1 }, true);
    expect(records[0].bondId).toBe('');
    records = await registry.queryRecords({ type: bot.type, name: bot.name, version: version2 }, true);
    expect(records[0].bondId).toBe('');
  });
};

if (mockServer) {
  // Required as jest complains if file has no tests.
  test('skipping bond tests', () => {});
} else {
  describe('Bonds', bondTests);
}
