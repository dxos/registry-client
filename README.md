# registry-client

## Usage

```
import { Account, Registry } from 'registry-client';
const endpoint = 'https://registry-testnet.wireline.ninja/query';
let registry = new Registry(endpoint);
```

### Generate private and public key

```
let mnemonic;

if (!mnemonic) {
  mnemonic = Account.generateMnemonic();
}

let key = Account.generateFromMnemonic(mnemonic);
```

### Query from registry

Get accounts:

```
let addresses = ['cosmos1sgdt4t6eq6thsewcpe2v9cu6c9ru837w7pj9lm'];
let result = await registry.getAccounts(addresses);
```

Get records by ids:

```
let ids = ['650f3ed2-f44e-43f2-9985-473422579fe6'];
let result = await registry.getRecordsByIds(ids);
```

Get records by attributes:

```
let attributes = { label: 'Weather' };
let result = await registry.getRecordsByAttributes(attributes);
```

Get bots by attributes:

```
let attributes = { name: 'TestBot', tag: 'first-test' };
let result = await registry.getBotsByAttributes(attributes);
```

### Write to registry

Publish record:

```
// Private key.
let payloadKey = '31c90b358117ea94bb45f1e6bbef7dc5bb20b6cb39f71790dd510a2190fe222b';

let record = {
  id: 'wrn:record:05013527-30ef-4aee-85d5-a71e1722f255',
  type: 'wrn:registry-type:service',
  attributes: {
    label: 'Weather'
  }
};

let result = await registry.setRecord(payloadKey, record);
```

Delete record:

```
// Private key.
let payloadKey = '31c90b358117ea94bb45f1e6bbef7dc5bb20b6cb39f71790dd510a2190fe222b';

let record = {
  id: 'wrn:record:05013527-30ef-4aee-85d5-a71e1722f255',
  type: 'wrn:registry-type:service',
  attributes: {
    label: 'Weather'
  }
};

let result = await registry.deleteRecord(payloadKey, record);
```
