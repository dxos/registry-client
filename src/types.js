//
// Copyright 2019 Wireline, Inc.
//

import { Util } from './util';

/**
 * Resource.
 */
export class Resource {
  /**
   * New Resource.
   * @param {object} resource
   * @param {object} ownerAccount
   */
  constructor(resource, ownerAccount) {
    let { id, type, systemAttributes = null, attributes = null, links = null } = resource;

    this.id = id;
    this.type = type;
    this.systemAttributes = Util.sortJSON(systemAttributes);
    this.attributes = Util.sortJSON(attributes);
    this.links = Util.sortJSON(links);
    this.ownerAccount = ownerAccount;
  }

  /**
   * Serialize Resource.
   */
  serialize() {
    return Util.sortJSON({
      "id": this.id.toString(),
      "type": this.type.toString(),
      "owner": {
        "id": "",
        "address": this.ownerAccount.registryAddress
      },
      "systemAttributes": btoa(JSON.stringify(this.systemAttributes)),
      "attributes": btoa(JSON.stringify(this.attributes)),
      "links": btoa(JSON.stringify(this.links))
    });
  }

  /**
   * Get message to calculate resource signature.
   */
  getMessageToSign() {
    return {
      "id": this.id.toString(),
      "type": this.type.toString(),
      "owner": {
        "id": "",
        "address": this.ownerAccount.registryAddress
      },
      "systemAttributes": this.systemAttributes,
      "attributes": this.attributes,
      "links": this.links
    }
  }
}

/**
 * Resource Signature.
 */
export class Signature {
  /**
   * New Signature.
   * @param {string} pubKey
   * @param {string} sig
   */
  constructor(pubKey, sig) {
    this.pubKey = pubKey;
    this.sig = sig;
  }

  /**
   * Serialize Signature.
   */
  serialize() {
    return Util.sortJSON({
      "pubKey": this.pubKey,
      "sig": this.sig
    });
  }
}

/**
 * Message Payload.
 */
export class Payload {
  /**
   * New Payload.
   * @param {object} resource
   * @param  {...any} signatures
   */
  constructor(resource, ...signatures) {
    this.resource = resource;
    this.signatures = signatures;
  }

  /**
   * Serialize Payload.
   */
  serialize() {
    return Util.sortJSON({
      "resource": this.resource.serialize(),
      "signatures": this.signatures.map(s => s.serialize())
    });
  }
}

/**
 * Transaction Message.
 */
export class Msg {
  /**
   * New Message.
   * @param {object} payload
   * @param {string} signer
   */
  constructor(payload, signer) {
    this.payload = payload;
    this.signer = signer;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      "Payload": this.payload.serialize(),
      "Signer": this.signer.toString()
    });
  }
}

/**
 * Transaction.
 */
export class Transaction {
  /**
   * New Transaction.
   * @param {object} message
   * @param {object} account
   * @param {object} fee
   * @param {string} signature
   * @param {string} accountNumber
   * @param {string} accountSequence
   */
  constructor(message, account, fee, signature, accountNumber, accountSequence) {
    fee.gas = parseInt(fee.gas);

    this.message = message;
    this.account = account;
    this.fee = fee;
    this.signature = signature;
    this.accountNumber = parseInt(accountNumber);
    this.accountSequence = parseInt(accountSequence);
  }

  /**
   * Serialize Transaction.
   */
  serialize() {
    return Util.sortJSON({
      "msg": [this.message.serialize()],
      "fee": this.fee,
      "signatures": [
        {
          "pub_key": this.account.registryPublicKey,
          "signature": this.signature.toString('base64'),
          "account_number": this.accountNumber,
          "sequence": this.accountSequence
        }
      ],
      "memo": ""
    });
  }
}
