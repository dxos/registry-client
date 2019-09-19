//
// Copyright 2019 Wireline, Inc.
//

import { Validator } from 'jsonschema';

import RecordSchema from './schema/record.json';
import { Util } from './util';

/**
 * Record.
 */
export class Record {
  /**
   * New Record.
   * @param {object} record
   * @param {object} ownerAccount
   */
  constructor(record, ownerAccount) {
    let validator = new Validator();
    let result = validator.validate(record, RecordSchema);
    if (!result.valid) {
      result.errors.map(console.error);
      throw new Error('Invalid record input.');
    }

    let { id, type, /* systemAttributes = null, */ attributes = null /*, links = null */ } = record;

    this.id = id;
    this.type = type;
    // this.systemAttributes = Util.sortJSON(systemAttributes);
    this.attributes = Util.sortJSON(attributes);
    // this.links = Util.sortJSON(links);
    this.ownerAccount = ownerAccount;
  }

  /**
   * Serialize record.
   */
  serialize() {
    return Util.sortJSON({
      "id": this.id.toString(),
      "type": this.type.toString(),
      "owner": this.ownerAccount.registryAddress,
      // "systemAttributes": btoa(JSON.stringify(this.systemAttributes)),
      "attributes": btoa(JSON.stringify(this.attributes)),
      // "links": btoa(JSON.stringify(this.links))
    });
  }

  /**
   * Get message to calculate record signature.
   */
  getMessageToSign() {
    return {
      "id": this.id.toString(),
      "type": this.type.toString(),
      "owner": this.ownerAccount.registryAddress,
      // "systemAttributes": this.systemAttributes,
      "attributes": this.attributes,
      // "links": this.links
    }
  }
}

/**
 * Record Signature.
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
   * @param {object} record
   * @param  {...any} signatures
   */
  constructor(record, ...signatures) {
    this.record = record;
    this.signatures = signatures;
  }

  /**
   * Serialize Payload.
   */
  serialize() {
    return Util.sortJSON({
      "record": this.record.serialize(),
      "signatures": this.signatures.map(s => s.serialize())
    });
  }
}

/**
 * Transaction Message.
 */
export class Msg {
  // Map operation to cosmos-sdk Message type.
  static OPERATION_TO_MSG_TYPE = {
    "set": "nameservice/SetRecord",
    "delete": "nameservice/DeleteRecord"
  };

  /**
   * New Message.
   * @param {string} operation
   * @param {object} payload
   * @param {string} signer
   */
  constructor(operation, payload, signer) {
    this.operation = operation;
    this.payload = payload;
    this.signer = signer;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      "type": Msg.OPERATION_TO_MSG_TYPE[this.operation],
      "value": {
        "Payload": this.payload.serialize(),
        "Signer": this.signer.toString()
      }
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
   * @param {string} chainID
   */
  constructor(message, account, fee, signature, accountNumber, accountSequence, chainID) {
    fee.gas = parseInt(fee.gas);

    this.message = message;
    this.account = account;
    this.fee = fee;
    this.signature = signature;
    // TODO(egorgripasov): use BigInt.
    this.accountNumber = parseInt(accountNumber);
    this.accountSequence = parseInt(accountSequence);
    this.chainID = chainID;
  }

  /**
   * Serialize Transaction.
   */
  serialize() {
    return Util.sortJSON({
      "account_number": this.accountNumber,
      "chain_id": this.chainID,
      "sequence": this.accountSequence,
      "msg": [this.message.serialize()],
      "fee": this.fee,
      "signatures": [
        {
          "pub_key": this.account.registryPublicKey,
          "signature": this.signature.toString('base64')
        }
      ],
      "memo": ""
    });
  }
}
