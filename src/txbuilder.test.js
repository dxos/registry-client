//
// Copyright 2020 DXOS.org
//

import path from 'path';

import { Account } from './account';
import { TxBuilder } from './txbuilder';
import { Msg, Record } from './types';
import { getBaseConfig } from './testing/helper';

const PRIVATE_KEY_2 = '7f7d35607229d9b86ed790dcdd30baf79783b816dab5a17b68827928bcd589dd';
const CHAIN = 'devnet';

// TODO: you could change me, but the test will fail.
const ACC_NUM = '1';
const ACC_SEQ = '4';

const YML_PATH = path.join(__dirname, './testing/data/bot.yml');

describe('Transactions.', () => {
  let bot;

  beforeAll(async () => {
    bot = await getBaseConfig(YML_PATH);
  });

  const TRANS_SIG = 'P+Jj43teIZkhCyYuOczdtBy8jZWzjGaKLiWdaxFq3mVmDS3AMJnECzt1C2czhNu8ethcw0rkPdPlLryL1z1XQQ==';

  test('Generate proper transaction signature.', () => {
    const acc = new Account(Buffer.from(PRIVATE_KEY_2, 'hex'));

    const record = new Record(bot.record, acc);

    const payload = TxBuilder.generatePayload(record);
    const message = new Msg('nameservice/SetRecord', {
      'Payload': payload.serialize(),
      'Signer': acc.formattedCosmosAddress.toString()
    });

    const fee = {
      amount: [
        {
          amount: '100',
          denom: 'udxt'
        }
      ],
      gas: '200000'
    };

    const transaction = TxBuilder.createTransaction(message, acc, ACC_NUM, ACC_SEQ, CHAIN, fee);
    expect(transaction.value.signatures[0].signature).toBe(TRANS_SIG);
  });
});
