//
// Copyright 2019 Wireline, Inc.
//

import { Registry } from './index';

const PRIVATE_KEY_BOB = '1dd3de39e732c8347761939b3de723a88caf8d048d55a47bac053899750eb787';
const PRIVATE_KEY_ALICE = 'e2c6712ace4c0d927d98129fd16c140495d03a065c5a7bbe461d2a150e44afe4';

const TEST_ATTR_VAL = 'bar';

const RECORD_OBJ = {
  id: 'wrn:record:05013527-30ef-4aee-85d5-a71e1722f255',
  type: 'wrn:registry-type:service',
  // systemAttributes: {
  //   uri: 'https://api.example.org/service'
  // },
  attributes: {
    label: 'Weather',
    test: TEST_ATTR_VAL
  }
};

jest.setTimeout(15000);

test.skip('Register record.', async () => {
  let registry = new Registry('http://localhost:8080/query');

  await registry.setRecord(PRIVATE_KEY_BOB, RECORD_OBJ, PRIVATE_KEY_ALICE);

  let records = await registry.getRecordsByAttributes({test:TEST_ATTR_VAL});
  console.log(JSON.stringify(records, null, 4));
});
