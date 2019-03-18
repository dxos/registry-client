//
// Copyright 2019 Wireline, Inc.
//

import { Util } from './util';

// TODO(egor): Comment.
export class Resource {

  // TODO(egor): Comment.
  constructor(id, type, ownerAccount, systemAttributes = null, attributes = null, links = null) {
    // TODO(egor): That's a lot of params. Consider passing in an object.
    this.id = id;
    this.type = type;
    this.ownerAccount = ownerAccount;
    this.systemAttributes = Util.sortJSON(systemAttributes);
    this.attributes = Util.sortJSON(attributes);
    this.links = Util.sortJSON(links);
  }

  // TODO(egor): Comment.
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

  // TODO(egor): Comment.
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

// TODO(egor): Comment.
export class Signature {

  // TODO(egor): Comment.
  constructor(pubKey, sig) {
    this.pubKey = pubKey;
    this.sig = sig;
  }

  // TODO(egor): Comment.
  serialize() {
    return Util.sortJSON({
      "pubKey": this.pubKey,
      "sig": this.sig
    });
  }
}

// TODO(egor): Comment.
export class Payload {

  // TODO(egor): Comment.
  constructor(resource, ...signatures) {
    this.resource = resource;
    this.signatures = signatures;
  }

  // TODO(egor): Comment.
  serialize() {
    return Util.sortJSON({
      "resource": this.resource.serialize(),
      "signatures": this.signatures.map(s => s.serialize())
    });
  }
}

// TODO(egor): Comment.
export class Msg {
  // TODO(egor): Comment.
  constructor(payload, signer) {
    this.payload = payload;
    this.signer = signer;
  }

  // TODO(egor): Comment.
  serialize() {
    return Util.sortJSON({
      "Payload": this.payload.serialize(),
      "Signer": this.signer.toString()
    });
  }
}


// TODO(egor): Comment.
export class Transaction {
  // TODO(egor): Comment.
  constructor(message, account, fee, signature, accountNumber, accountSequence) {
    fee.gas = parseInt(fee.gas);

    this.message = message;
    this.account = account;
    this.fee = fee;
    this.signature = signature;
    this.accountNumber = parseInt(accountNumber);
    this.accountSequence = parseInt(accountSequence);
  }

  // TODO(egor): Comment.
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
