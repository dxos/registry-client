# registry-client

## Usage

```
import { Account, Registry } from 'registry-client';
const endpoint = 'https://wns-testnet.wireline.ninja/query';
const registry = new Registry(endpoint);
```

### Generate private and public key

```
let mnemonic;

if (!mnemonic) {
  mnemonic = Account.generateMnemonic();
}

const key = Account.generateFromMnemonic(mnemonic);
```

### Query from registry

Get accounts:

```
const addresses = ['cosmos1sgdt4t6eq6thsewcpe2v9cu6c9ru837w7pj9lm'];
const result = await registry.getAccounts(addresses);
```

Get records by ids:

```
let ids = ['650f3ed2-f44e-43f2-9985-473422579fe6'];
let result = await registry.getRecordsByIds(ids);
```

Get records by attributes:

```
let attributes = { type: 'wrn:bot' };
let result = await registry.queryRecords(attributes);
```

### Write to registry

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


## Tests

`yarn test` allows to run tests against an external GQL endpoint. By default `http://localhost:9473` endpoint is used, but could be changed by `WNS_GQL_ENDPOINT` ENV var.

```
$ WNS_GQL_ENDPOINT=http://127.0.0.1:4000/ yarn test
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
