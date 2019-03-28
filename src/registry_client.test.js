//
// Copyright 2019 Wireline, Inc.
//

import { RegistryClient } from './registry_client';

const ADDR = 'cosmos1g7648lx9jtt23vqpcvry3auh305k2xm9s92v7e';
const RES_ID = 'wrn:record:05013527-30ef-4aee-85d5-a71e1722f255';

test.skip('Get accounts.', async () => {
  let registry = new RegistryClient('http://localhost:8080/query');
  let accounts = await registry.getAccounts([ADDR]);

  console.log(JSON.stringify(accounts, null, 4));
});

test.skip('Get records.', async () => {
  let registry = new RegistryClient('http://localhost:8080/query');
  let records = await registry.getRecordsByIds([RES_ID]);

  console.log(JSON.stringify(records, null, 4));
});

test.skip('List records.', async () => {
  let registry = new RegistryClient('http://localhost:8080/query');
  let records = await registry.getRecordsByAttributes({});

  console.log(JSON.stringify(records, null, 4));
});
