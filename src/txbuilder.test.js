//
// Copyright 2019 Wireline, Inc.
//

import path from 'path';

import { Account } from './account';
import { TxBuilder } from './txbuilder';
import { Record } from './types';
import { getBaseConfig } from './testing/helper';

const PRIVATE_KEY_2 = '7f7d35607229d9b86ed790dcdd30baf79783b816dab5a17b68827928bcd589dd';
const CHAIN = 'wireline';

// TODO: you could change me, but the test will fail.
const ACC_NUM = '1';
const ACC_SEQ = '4';

const YML_PATH = path.join(__dirname, './testing/data/bot.yml');

describe('Transactions.', () => {
  let bot;

  beforeAll(async () => {
    bot = await getBaseConfig(YML_PATH);
  });

  const TRANS_SIG = '9Z+116tfyEN8ZY/iNXAsgEcDJ4FlF4ntX9dHqzmlkvNh5to7804J/GGnSPmu0OD+yLe8imylWQSzsTBdpuaFgA==';

  test('Generate proper transaction signature.', () => {
    const acc = new Account(Buffer.from(PRIVATE_KEY_2, 'hex'));

    const record = new Record(bot.record, acc);

    const payload = TxBuilder.generatePayload(record);

    const transaction = TxBuilder.createTransaction(payload, acc, ACC_NUM, ACC_SEQ, CHAIN);
    expect(transaction.signatures[0].signature).toBe(TRANS_SIG);
  });
});
