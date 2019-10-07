//
// Copyright 2019 Wireline, Inc.
//

import yaml from 'node-yaml';
import semver from 'semver';

import { Registry } from './index';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';

jest.setTimeout(120 * 1000);

async function sleep(timeout = 1 * 1000) {
  await new Promise(r => setTimeout(r, timeout));
}

describe('Registering', () => {
  let bot;
  let pad;
  let protocol;

  const registry = new Registry('http://localhost:9473/query');

  const ensureConf = async path => {
    const conf = await yaml.read(path);
    conf.record.attributes.version = semver.inc(conf.record.attributes.version, 'patch');
    await yaml.write(path, conf);

    return conf;
  };

  beforeAll(async () => {
    bot = await ensureConf('./testing/bot.yml');
    pad = await ensureConf('./testing/pad.yml');
    protocol = await ensureConf('./testing/protocol.yml');
  });

  test('Register protocol.', async () => {
    await registry.setRecord(PRIVATE_KEY, protocol.record, PRIVATE_KEY);
    await sleep();
  });

  test('Register bot.', async () => {
    await registry.setRecord(PRIVATE_KEY, bot.record, PRIVATE_KEY);
    await sleep();
  });

  test('Register pad.', async () => {
    await registry.setRecord(PRIVATE_KEY, pad.record, PRIVATE_KEY);
    await sleep();
  });
});
