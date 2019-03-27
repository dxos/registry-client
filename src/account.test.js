//
// Copyright 2019 Wireline, Inc.
//

import { Account } from './account';

const PRIVATE_KEY = '1c374e7c80d72faf0ac125432b9dfa93c1ee07c37fa99db5f81c81889fa9d07e';
const PUBLIC_KEY = '0330a4d47fbaebf6b2d9abc2b5921b6a61a3262477ac2cb0daf2c36fbd24beb903';
const ADDRESS = '13e5d36d697c30bec5bb70251c7473935573ab55';
const FORMATTED_ADDRESS = 'cosmos1z0jaxmtf0scta3dmwqj3carnjd2h8264ut9vvl';

const PRIVATE_KEY_2 = '7f7d35607229d9b86ed790dcdd30baf79783b816dab5a17b68827928bcd589dd';
const REGISTRY_PUBLIC_KEY = '61rphyECRYVJ4HX4HwQy8pG4WuXWZn2oArJyicXUU8xA6X4Ycy8=';
const REGISTRY_ADDRESS = 'eec4c68e77c6726ca41f261441d4b4870d2748d4';

const RECORD_SIGNATURE = '1+CI/EcDwGXVoo8Crras1UASMmEaE9dRUGdiQeDWJ0kVdBMRpeUgCX+pW12g7igwwCiu/Oeiwm+oZ99GvT2e3g==';

test('Generate account from private key.', () => {
  let acc = new Account(Buffer.from(PRIVATE_KEY, 'hex'));
  expect(acc.publicKey.toString('hex')).toBe(PUBLIC_KEY);
  expect(acc.cosmosAddress).toBe(ADDRESS);
  expect(acc.formattedCosmosAddress).toBe(FORMATTED_ADDRESS);
});

test('Generate account from mnenonic.', () => {
  let mnenonic = Account.generateMnemonic();
  let acc1 = Account.generateFromMnemonic(mnenonic);
  let acc2 = Account.generateFromMnemonic(mnenonic);
  expect(acc1.formattedCosmosAddress).toBe(acc2.formattedCosmosAddress);
});

test('Generate registry specific public key and address.', () => {
  let acc = new Account(Buffer.from(PRIVATE_KEY_2, 'hex'));
  expect(acc.registryPublicKey).toBe(REGISTRY_PUBLIC_KEY);
  expect(acc.registryAddress).toBe(REGISTRY_ADDRESS);
});

test('Ability to sign record obj.', () => {
  let acc = new Account(Buffer.from(PRIVATE_KEY_2, 'hex'));
  let record = {
    id: '05013527-30ef-4aee-85d5-a71e1722f255',
    type: 'Service',
    owner: acc.registryAddress,
    // systemAttributes: {
    //   uri: 'https://api.example.org/service'
    // },
    attributes: {
      label: 'Weather'
    },
    // links: null
  };
  let signature = acc.signRecord(record);
  expect(signature.toString('base64')).toBe(RECORD_SIGNATURE);
});
