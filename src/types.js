//
// Copyright 2019 Wireline, Inc.
//

import { Util } from './util';

export class Resource {
  constructor(id, type, ownerAccount, systemAttributes = null, attributes = null, links = null) {
    this.id = id;
    this.type = type;
    this.ownerAccount = ownerAccount;
    this.systemAttributes = Util.sortJSON(systemAttributes);
    this.attributes = Util.sortJSON(attributes);
    this.links = Util.sortJSON(links);
  }

  serialize() {
    return Util.sortJSON({
      "id": this.id.toString(),
      "type": this.type.toString(),
      "owner": {
        "id": "",
        "address": this.ownerAccount.wirechainAddress
      },
      "systemAttributes": btoa(JSON.stringify(this.systemAttributes)),
      "attributes": btoa(JSON.stringify(this.attributes)),
      "links": btoa(JSON.stringify(this.links))
    });
  }

  getMessageToSign() {
    return {
      "id": this.id.toString(),
      "type": this.type.toString(),
      "owner": {
        "id": "",
        "address": this.ownerAccount.wirechainAddress
      },
      "systemAttributes": this.systemAttributes,
      "attributes": this.attributes,
      "links": this.links
    }
  }
}

export class Signature {
  constructor(pubKey, sig) {
    this.pubKey = pubKey;
    this.sig = sig;
  }

  serialize() {
    return Util.sortJSON({
      "pubKey": this.pubKey,
      "sig": this.sig
    });
  }
}

export class Payload {
  constructor(resource, ...signatures) {
    this.resource = resource;
    this.signatures = signatures;
  }

  serialize() {
    return Util.sortJSON({
      "resource": this.resource.serialize(),
      "signatures": this.signatures.map(s => s.serialize())
    });
  }
}

export class Msg {
  constructor(payload, signer) {
    this.payload = payload;
    this.signer = signer;
  }

  serialize() {
    return Util.sortJSON({
      "Payload": this.payload.serialize(),
      "Signer": this.signer.toString()
    });
  }
}


export class Transaction {
  constructor(message, account, fee, signature, accountNumber, accountSequence) {
    fee.gas = parseInt(fee.gas);

    this.message = message;
    this.account = account;
    this.fee = fee;
    this.signature = signature;
    this.accountNumber = parseInt(accountNumber);
    this.accountSequence = parseInt(accountSequence);
  }

  serialize() {
    return Util.sortJSON({
      "msg": [this.message.serialize()],
      "fee": this.fee,
      "signatures": [
        {
          "pub_key": this.account.wirechainPublicKey,
          "signature": this.signature.toString('base64'),
          "account_number": this.accountNumber,
          "sequence": this.accountSequence
        }
      ],
      "memo": ""
    });
  }
}
