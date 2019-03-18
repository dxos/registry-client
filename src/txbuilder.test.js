//
// Copyright 2019 Wireline, Inc.
//

import { Account } from './account';
import { TxBuilder } from './txbuilder';
import { Resource } from './types';

const PRIVATE_KEY_2 = '7f7d35607229d9b86ed790dcdd30baf79783b816dab5a17b68827928bcd589dd';
const CHAIN = 'wireline';

// TODO: you could change me, but the test will fail.
const ACC_NUM = '1';
const ACC_SEQ = '4';

const RESOURCE_OBJ = {
  id: '05013527-30ef-4aee-85d5-a71e1722f255',
  type: 'Service',
  systemAttributes: {
    uri: 'https://api.example.org/service'
  },
  attributes: {
    label: 'Weather'
  }
};

const TRANS_SIG = 'UuFvM/xpPkHgcQ4pWarqW+MIjSkCV6IijQZumQ92zrtmQNKOJd0b5sNcXe9eZUHynAo2NyeNow4Pty3+ts0p1Q==';

test('Generate proper transaction signature.', () => {
  let acc = new Account(Buffer.from(PRIVATE_KEY_2, 'hex'));

  let resource = new Resource(RESOURCE_OBJ, acc);

  let payload = TxBuilder.generatePayload(resource);

  let transaction = TxBuilder.createTransaction(payload, acc, ACC_NUM, ACC_SEQ, CHAIN);
  expect(transaction.signatures[0].signature).toBe(TRANS_SIG);
});
