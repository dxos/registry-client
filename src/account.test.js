//
// Copyright 2019 Wireline, Inc.
//

import path from 'path';

import { Account } from './account';
import { getBaseConfig } from './testing/helper';

const PRIVATE_KEY = '1c374e7c80d72faf0ac125432b9dfa93c1ee07c37fa99db5f81c81889fa9d07e';
const PUBLIC_KEY = '0430a4d47fbaebf6b2d9abc2b5921b6a61a3262477ac2cb0daf2c36fbd24beb90368ec43bc55f9bedbac2aaada021e54321d1a30faa99e4acebcd613037c6ff815';
const ADDRESS = '252a60651f3c801e66c84ce070184ebd7aebf1d9';
const FORMATTED_ADDRESS = 'cosmos1r6hlwhyd9yh76vt2a47tc3aw6ykzk0t33dsym6';

const PRIVATE_KEY_2 = '7f7d35607229d9b86ed790dcdd30baf79783b816dab5a17b68827928bcd589dd';
const RECORD_SIGNATURE = 'StInDYpYlQvoX1nS9X+TVqnu/nGAydpPDUVxKTVVA/pohmvTeGqqVWHWSxWkivgOa+YG6BBQv/U8VfIcDk91bw==';

const YML_PATH = path.join(__dirname, './testing/data/bot.yml');

describe('Accounts', () => {
  let bot;

  beforeAll(async () => {
    bot = await getBaseConfig(YML_PATH);
  });

  test('Generate account from private key.', () => {
    const acc = new Account(Buffer.from(PRIVATE_KEY, 'hex'));
    expect(Buffer.from(acc.publicKey).toString('hex')).toBe(PUBLIC_KEY);
    expect(acc.cosmosAddress).toBe(ADDRESS);
    expect(acc.formattedCosmosAddress).toBe(FORMATTED_ADDRESS);
  });

  test('Generate account from mnenonic.', () => {
    const mnenonic = Account.generateMnemonic();
    const acc1 = Account.generateFromMnemonic(mnenonic);
    const acc2 = Account.generateFromMnemonic(mnenonic);
    expect(acc1.formattedCosmosAddress).toBe(acc2.formattedCosmosAddress);
  });

  test('Ability to sign record obj.', () => {
    const acc = new Account(Buffer.from(PRIVATE_KEY_2, 'hex'));
    const signature = acc.signRecord(bot.record);
    expect(signature.toString('base64')).toBe(RECORD_SIGNATURE);
  });
});
