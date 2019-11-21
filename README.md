# registry-client

## Usage

```
import { Account, Registry } from '@wirelineio/registry-client';
const endpoint = 'https://wns-testnet.wireline.ninja';
const registry = new Registry(endpoint);
```

### Generate Private & Public Keys

```
let mnemonic;

if (!mnemonic) {
  mnemonic = Account.generateMnemonic();
}

const key = Account.generateFromMnemonic(mnemonic);
```

### Query WNS

Get accounts:

```
const addresses = ['cosmos1sgdt4t6eq6thsewcpe2v9cu6c9ru837w7pj9lm'];
const result = await registry.getAccounts(addresses);
```

Get records by ids:

```
let ids = ['QmfKZkWQdWFtUnsJt4Uakp3jSzXKHcafY5sMnyPodR9Ks2'];
let result = await registry.getRecordsByIds(ids);
```

Query records by attributes:

```
let attributes = { type: 'wrn:bot' };
let result = await registry.queryRecords(attributes);
```

### Write to WNS

Publish record:

```
// Private key.
let payloadKey = '31c90b358117ea94bb45f1e6bbef7dc5bb20b6cb39f71790dd510a2190fe222b';

let record = {
  "type": "wrn:protocol",
  "name": "wireline.io/chess",
  "version": "1.5.2"
};

let result = await registry.setRecord(payloadKey, record);
```

Send coins:

```
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let toAddress = 'cosmos1w5q7xy9sk8hqvlklftdfdkc3kgsd90cxlkwvty';

await registry.sendCoins([{ denom: 'wire', amount: '100' }], toAddress, privateKey);
```

## Tests

`yarn test` allows to run tests against an external GQL endpoint (of a real WNS server). By default `http://localhost:9473` endpoint is used, but could be changed by `WNS_GQL_ENDPOINT` ENV var.

```
$ WNS_GQL_ENDPOINT=https://wns-testnet.wireline.ninja yarn test
```

`yarn test:in-mem-wns` spins up an in-process mock GQL server for the duration of the tests.

```
$ yarn test:in-mem-wns
```

It's also possible to run the mock GQL server standalone and interact with it using the GQL Playground (http://127.0.0.1:4000/).

```
$ yarn start:in-mem-wns --help
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --host     GQL server host                     [string] [default: "127.0.0.1"]
  --port     GQL server port                            [number] [default: 4000]

$ yarn start:in-mem-wns
yarn run v1.17.3
$ BABEL_DISABLE_CACHE=1 DEBUG=test babel-node src/mock/main.js
Mock server running on http://127.0.0.1:4000/
```
