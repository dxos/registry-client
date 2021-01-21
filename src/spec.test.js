//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import path from 'path';

import { Registry } from './index';
import { getConfig, ensureUpdatedConfig, provisionBondId } from './testing/helper';
import { startMockServer } from './mock/server';

const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');
const PAD_YML_PATH = path.join(__dirname, './testing/data/pad.yml');
const PROTOCOL_YML_PATH = path.join(__dirname, './testing/data/protocol.yml');

const log = debug('test');

jest.setTimeout(120 * 1000);

const { mockServer, wns: { chainId, endpoint, privateKey, fee } } = getConfig();

async function sleep(timeout = 1 * 1000) {
  await new Promise(r => setTimeout(r, timeout));
}

describe('Registering', () => {
  let bot;
  let pad;
  let protocol;

  let mock;
  let registry;

  let createdPad;
  let createdProtocol;

  let bondId;

  beforeAll(async () => {
    if (mockServer) {
      mock = await startMockServer();
      log('Started mock server:', mock.serverInfo.url);
    }

    registry = new Registry(mock ? mock.serverInfo.url : endpoint, chainId);
    bondId = await provisionBondId(registry, privateKey, mockServer);

    bot = await ensureUpdatedConfig(BOT_YML_PATH);
    pad = await ensureUpdatedConfig(PAD_YML_PATH);
    protocol = await ensureUpdatedConfig(PROTOCOL_YML_PATH);
  });

  test('Register protocol.', async () => {
    await sleep();
    await registry.setRecord(privateKey, protocol.record, privateKey, bondId, fee);
    await sleep();

    const { version, name, type } = protocol.record;
    const records = await registry.queryRecords({ version, name, type }, true);
    [ createdProtocol ] = records;
  });

  test('Register bot.', async () => {
    bot.record.protocol['/'] = createdProtocol.id;
    await registry.setRecord(privateKey, bot.record, privateKey, bondId, fee);
    await sleep();
  });

  test('Register pad.', async () => {
    pad.record.protocol['/'] = createdProtocol.id;
    await registry.setRecord(privateKey, pad.record, privateKey, bondId, fee);
    await sleep();
  });

  // Sample queries.
  test('Get version of specific module.', async () => {
    const { version, name, type } = pad.record;
    const records = await registry.queryRecords({ version, name, type }, true);
    expect(records.length).toBe(1);

    [ createdPad ] = records;
    const { attributes: { version: recordVersion, name: recordName, type: recordType } } = createdPad;
    expect(recordVersion).toBe(version);
    expect(recordName).toBe(name);
    expect(recordType).toBe(type);
  });

  test('Get dependency graph of a module - graphwalk.', async () => {
    const { version, name, type } = pad.record;
    const records = await registry.queryRecords({ version, name, type }, true, true);
    expect(records.length).toBe(1);

    const [ padWithRefs ] = records;
    expect(padWithRefs.references).toBeDefined();
    expect(padWithRefs.references).toHaveLength(1);

    const [ referencedProto ] = padWithRefs.references;
    expect(referencedProto.id).toEqual(createdProtocol.id);
    expect(referencedProto.type).toEqual(createdProtocol.type);
    expect(referencedProto.version).toEqual(createdProtocol.version);
  });

  test('Get bots depending on a particular version of a protocol.', async () => {
    const { version, name, type } = protocol.record;
    const records = await registry.queryRecords({ version, name, type }, true);
    expect(records.length).toBe(1);

    const { id } = records[0];

    const botRecords = await registry.queryRecords({ type: 'bot', protocol: { '/': id } }, true);
    expect(botRecords.length).toBe(1);
    expect(botRecords[0].attributes.protocol['/']).toEqual(id);
  });

  test('Get bots compatible with a specific pad.', async () => {
    const { protocol } = createdPad.attributes;
    const botRecords = await registry.queryRecords({ type: 'bot', protocol }, true);

    expect(botRecords.length).toBe(1);
    const [ bot ] = botRecords;
    expect(bot.attributes.protocol).toEqual(protocol);
  });

  test('LP client can show visual graph of dependencies.', async () => {
    // Get Pad and corresponding Protocol.
    const { version, name, type } = pad.record;
    const records = await registry.queryRecords({ version, name, type }, true, true);
    expect(records.length).toBe(1);

    const [ padWithRefs ] = records;
    expect(padWithRefs.references).toBeDefined();
    expect(padWithRefs.references).toHaveLength(1);

    const [ referencedProto ] = padWithRefs.references;
    expect(referencedProto.id).toEqual(createdProtocol.id);
    expect(referencedProto.type).toEqual(createdProtocol.type);
    expect(referencedProto.version).toEqual(createdProtocol.version);

    // Get Bots that support such protocol.
    const { id } = referencedProto;
    const botRecords = await registry.queryRecords({ type: 'bot', protocol: { '/': id } }, true);
    expect(botRecords.length).toBe(1);
    expect(botRecords[0].attributes.protocol['/']).toEqual(id);
  });

  afterAll(async () => {
    if (mock) {
      await mock.mockServer.stop();
    }
  });
});
