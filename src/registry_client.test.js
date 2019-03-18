//
// Copyright 2019 Wireline, Inc.
//

import { RegistryClient } from './registry_client';

const ADDR = 'cosmos1g7648lx9jtt23vqpcvry3auh305k2xm9s92v7e';
const RES_ID = '05013527-30ef-4aee-85d5-a71e1722f255';

test.skip('Get accounts.', async () => {
  let registry = new RegistryClient();
  let accounts = await registry.getAccounts([ADDR]);

  console.log(JSON.stringify(accounts, null, 4));
});

test.skip('Get resources.', async () => {
  let registry = new RegistryClient();
  let resources = await registry.getResources([RES_ID]);

  console.log(JSON.stringify(resources, null, 4));
});

test.skip('List resources.', async () => {
  let registry = new RegistryClient();
  let resources = await registry.listResources([RES_ID]);

  console.log(JSON.stringify(resources, null, 4));
})