//
// Copyright 2020 Wireline, Inc.
//

import debug from 'debug';
import path from 'path';
import graphviz from 'graphviz';
import fs from 'fs';

import { Registry } from './index';
import { getConfig, ensureUpdatedConfig, provisionBondId } from './testing/helper';
import { startMockServer } from './mock/server';
import { schema } from './testing/proto/gen/index.ts';

const PROTOCOL_YML_PATH = path.join(__dirname, './testing/data/protocol.yml');
const APP_YML_PATH = path.join(__dirname, './testing/data/app.yml');
const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');

const COLOR_MAP = {
  'proto': 'red',
  'protocol': 'orange',
  'bot': 'blue',
  'app': 'green'
};

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

const getGraphNodeId = (attributes) => {
  const { type, name, version } = attributes;
  return `${type}:${name}#${version}`;
};

describe('Protobuf support / type graph', () => {
  const protocolPayloadType = 'wrn://dxos/type/chess-protocol';
  const appPayloadType = 'wrn://dxos/type/chess-app';
  const botPayloadType = 'wrn://dxos/type/chess-bot';

  const appProto = { type: 'proto', name: 'ChessApp Protobuf', version: '1.0.0', ipfs: { '/': 'CID(app.proto)' } };
  const botProto = { type: 'proto', name: 'ChessBot Protobuf', version: '1.0.0', ipfs: { '/': 'CID(bot.proto)' } };

  const names = { [protocolPayloadType]: 'ipfs' };

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

    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
  });

  test('Register proto files', async () => {
    await registry.setRecord(privateKey, appProto, privateKey, bondId, fee);
    names[appPayloadType] = getGraphNodeId(appProto);

    await registry.setRecord(privateKey, botProto, privateKey, bondId, fee);
    names[botPayloadType] = getGraphNodeId(botProto);
  });

  test('Register protocol.', async () => {
    await sleep();

    const record = {
      ...protocol.record,
      payloadType: protocolPayloadType,
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

      payloadType: botPayloadType,
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

      payloadType: appPayloadType,
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

  test('Graph records.', async () => {
    const records = await registry.queryRecords({}, true);
    log(JSON.stringify(names, null, 2));
    log(JSON.stringify(records, null, 2));

    const recordsById = {};
    records.forEach(record => {
      recordsById[record.id] = record;
    });

    const g = graphviz.digraph('G');
    g.addNode('ipfs');

    /* eslint-disable no-restricted-syntax */
    const ids = Object.keys(recordsById);
    ids.forEach(id => {
      const record = recordsById[id];
      log(JSON.stringify(record));

      const { type } = record.attributes;
      const wrn = getGraphNodeId(record.attributes);
      g.addNode(wrn, { color: COLOR_MAP[type] });
      for (const [propName, propValue] of Object.entries(record.attributes)) {
        if (propName !== 'ipfs' && propValue && typeof (propValue) === 'object' && propValue['/']) {
          log(propValue);
          const refRecord = recordsById[propValue['/']];
          const refWrn = getGraphNodeId(refRecord.attributes);
          g.addEdge(wrn, refWrn, { label: propName });
        }

        if (propName === 'payloadType') {
          g.addEdge(wrn, names[propValue], { label: `payloadType => resolve(${propValue})` });
        }

        if (propName === 'ipfs') {
          g.addEdge(wrn, 'ipfs', { label: `ipfs ${propValue['/']}` });
        }
      }
    });

    // `brew install graphviz` if this errors.
    g.output('png', 'out/graph.png');
  });

  afterAll(async () => {
    if (mock) {
      await mock.mockServer.stop();
    }
  });
});
