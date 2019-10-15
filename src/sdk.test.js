//
// Copyright 2019 Wireline, Inc.
//

import path from 'path';

import { Registry } from './index';
import { ensureUpdatedConfig } from './testing/helper';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';

const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');
const PAD_YML_PATH = path.join(__dirname, './testing/data/pad.yml');
const PROTOCOL_YML_PATH = path.join(__dirname, './testing/data/protocol.yml');

jest.setTimeout(120 * 1000);

async function sleep(timeout = 1 * 1000) {
  await new Promise(r => setTimeout(r, timeout));
}

describe('Registering', () => {
  let bot;
  let pad;
  let protocol;

  const registry = new Registry('http://localhost:9473/query');

  beforeAll(async () => {
    bot = await ensureUpdatedConfig(BOT_YML_PATH);
    pad = await ensureUpdatedConfig(PAD_YML_PATH);
    protocol = await ensureUpdatedConfig(PROTOCOL_YML_PATH);
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
