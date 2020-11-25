//
// Copyright 2020 Wireline, Inc.
//

import debug from 'debug';
import path from 'path';

import { Registry } from './index';
import { getConfig, ensureUpdatedConfig, provisionBondId } from './testing/helper';
import { startMockServer } from './mock/server';
import { schema } from './testing/proto/gen/index.ts';

const PROTOCOL_YML_PATH = path.join(__dirname, './testing/data/protocol.yml');
const APP_YML_PATH = path.join(__dirname, './testing/data/app.yml');
const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');

const log = debug('test');

jest.setTimeout(120 * 1000);

const { mockServer, wns: { chainId, endpoint, privateKey, fee } } = getConfig();

async function sleep(timeout = 1 * 1000) {
  await new Promise(r => setTimeout(r, timeout));
}

const encodeProtoToBase64 = (typeName, obj) => {
  const codec = schema.getCodecForType(typeName);
  const encoded = codec.encode(obj);

  return encoded.toString('base64');
};

describe('Protobuf support / type graph', () => {
  let bot;
  let app;
  let protocol;

  let mock;
  let registry;

  let createdApp;
  let createdProtocol;

  let bondId;

  beforeAll(async () => {
    if (mockServer) {
      mock = await startMockServer([]);
      log('Started mock server:', mock.serverInfo.url);
    }

    registry = new Registry(mock ? mock.serverInfo.url : endpoint, chainId);
    bondId = await provisionBondId(registry, privateKey, mockServer);

    bot = await ensureUpdatedConfig(BOT_YML_PATH);
    app = await ensureUpdatedConfig(APP_YML_PATH);
    protocol = await ensureUpdatedConfig(PROTOCOL_YML_PATH);
  });

  test('Register proto files', async () => {
    await registry.setRecord(privateKey, { type: 'proto', ipfs: { '/': 'CID(app.proto)' } }, privateKey, bondId, fee);
    await registry.setRecord(privateKey, { type: 'proto', ipfs: { '/': 'CID(bot.proto)' } }, privateKey, bondId, fee);
  });

  test('Register protocol.', async () => {
    await sleep();

    const record = {
      ...protocol.record,
      ipfs: {
        '/': 'CID(protocol.proto)'
      }
    };

    await registry.setRecord(privateKey, record, privateKey, bondId, fee);
    await sleep();

    const { version, name, type } = protocol.record;
    const records = await registry.queryRecords({ version, name, type }, true);
    [ createdProtocol ] = records;
  });

  test('Register bot.', async () => {
    bot.record.protocol['/'] = createdProtocol.id;

    const payload = encodeProtoToBase64('test.ChessBot', {
      meta: {
        author: 'John Doe',
        repository: 'https://github.com/dxos/bot-tutorials'
      },
      platform: 'linux'
    });

    const record = {
      ...bot.record,

      payloadType: 'wrn://dxos/type/chess-bot',
      payload
    };

    await registry.setRecord(privateKey, record, privateKey, bondId, fee);
    await sleep();
  });

  test('Register app.', async () => {
    app.record.protocol['/'] = createdProtocol.id;

    const payload = encodeProtoToBase64('test.ChessApp', {
      meta: {
        author: 'John Doe',
        repository: 'https://github.com/dxos/app-tutorials'
      },
      variant: 'chess960'
    });

    const record = {
      ...app.record,

      payloadType: 'wrn://dxos/type/chess-app',
      payload
    };

    await registry.setRecord(privateKey, record, privateKey, bondId, fee);
    await sleep();

    const { version, name, type } = app.record;
    const records = await registry.queryRecords({ version, name, type }, true);
    expect(records.length).toBe(1);

    [ createdApp ] = records;
  });

  test('Get bots compatible with a specific app.', async () => {
    const { protocol } = createdApp.attributes;
    const botRecords = await registry.queryRecords({ type: 'bot', protocol }, true);

    expect(botRecords.length).toBe(1);
    const [ bot ] = botRecords;
    expect(bot.attributes.protocol).toEqual(protocol);
  });

  afterAll(async () => {
    const records = await registry.queryRecords({}, true);
    log(JSON.stringify(records, null, 2));

    if (mock) {
      await mock.mockServer.stop();
    }
  });
});
