# registry-client

## Usage

```JavaScript
import { Account, Registry } from '@wirelineio/registry-client';
const endpoint = 'http://localhost:9473/api';
const registry = new Registry(endpoint);
```

### Generate Private & Public Keys

```JavaScript
let mnemonic;

if (!mnemonic) {
  mnemonic = Account.generateMnemonic();
}

const key = Account.generateFromMnemonic(mnemonic);
```

### Query WNS

Get accounts:

```JavaScript
const addresses = ['cosmos1sgdt4t6eq6thsewcpe2v9cu6c9ru837w7pj9lm'];
const result = await registry.getAccounts(addresses);
```

Get records by ids:

```JavaScript
let ids = ['QmfKZkWQdWFtUnsJt4Uakp3jSzXKHcafY5sMnyPodR9Ks2'];
let result = await registry.getRecordsByIds(ids);
```

Query records by attributes:

```JavaScript
let attributes = { type: 'wrn:bot' };
let result = await registry.queryRecords(attributes);
```

Get bonds by ids:

```JavaScript
let ids = ['8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3'];
let result = await registry.getBondsByIds(ids);
```

Query bonds (by owner):

```JavaScript
let owner = 'cosmos1zk8etz23phxgtse8re6tggsr3nrfk2vtsesegy';
const result = await registry.queryBonds({ owner });
```

### Write to WNS

Publish record:

```JavaScript
// Private key & bond ID.
let payloadKey = '31c90b358117ea94bb45f1e6bbef7dc5bb20b6cb39f71790dd510a2190fe222b';
let bondId = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';

let record = {
  "type": "wrn:protocol",
  "name": "wireline.io/chess",
  "version": "1.5.2"
};

let result = await registry.setRecord(payloadKey, record, txKey, bondId);
```

Send coins:

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let toAddress = 'cosmos1w5q7xy9sk8hqvlklftdfdkc3kgsd90cxlkwvty';

await registry.sendCoins([{ denom: 'wire', amount: '100' }], toAddress, privateKey);
```

Create bond:

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let denom = 'uwire';
let amount = '10000';

const result = await registry.createBond([{ denom, amount }], privateKey);
```

Refill bond:

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let bondId = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';
let denom = 'uwire';
let amount = '500';

const result = await registry.refillBond(bondId, [{ denom, amount }], privateKey);
```

Withdraw funds from bond:

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let bondId = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';
let denom = 'uwire';
let amount = '500';

const result = await registry.withdrawBond(bondId, [{ denom, amount }], privateKey);
```

Cancel bond:

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let bondId = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';

const result = await registry.cancelBond(bondId, privateKey);
```

Associate record with bond:

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let recordId = 'QmfYFV686CmEuDfd12NkoY94AoVYTKqw7ptaovLgiRSxL2';
let bondId = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';

const result = await registry.associateBond(recordId, bondId, privateKey);
```

Dissociate record from bond:

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let recordId = 'QmfYFV686CmEuDfd12NkoY94AoVYTKqw7ptaovLgiRSxL2';

const result = await registry.dissociateBond(recordId, privateKey);
```

Dissociate all records from bond:

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let bondId = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';

const result = await registry.dissociateRecords(bondId, privateKey);
```

Reassociate records with new bond (switch bond):

```JavaScript
let privateKey = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';
let oldBondId = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';
let newBondId = 'e205a46f6ec6f662cbfad84f4f926973422bf6217d8d2c2eebff94d148fd486d';

const result = await registry.reassociateRecords(oldBondId, newBondId, privateKey);
```

## Tests

`yarn test` allows to run tests against an external GQL endpoint (of a real WNS server). By default `http://localhost:9473` endpoint is used, but could be changed by `WNS_GQL_ENDPOINT` ENV var.

```bash
$ WNS_GQL_ENDPOINT=https://wns-testnet.wireline.ninja yarn test
```

`yarn test:in-mem-wns` spins up an in-process mock GQL server for the duration of the tests.

```bash
$ yarn test:in-mem-wns
```

It's also possible to run the mock GQL server standalone and interact with it using the GQL Playground (http://127.0.0.1:4000/).

```bash
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
