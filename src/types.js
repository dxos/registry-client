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
    const validator = new Validator();
    const result = validator.validate(record, RecordSchema);
    if (!result.valid) {
      result.errors.map(console.error);
      throw new Error('Invalid record input.');
    }

    this.record = record;
    this.ownerAccount = ownerAccount;
  }

  /**
   * Serialize record.
   */
  serialize() {
    return Util.sortJSON({
      'attributes': btoa(JSON.stringify(this.record))
    });
  }

  /**
   * Get message to calculate record signature.
   */
  getMessageToSign() {
    return Util.sortJSON(this.record);
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
      'pubKey': this.pubKey,
      'sig': this.sig
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
      'record': this.record.serialize(),
      'signatures': this.signatures.map(s => s.serialize())
    });
  }
}

/**
 * Transaction Message.
 */
export class Msg {

  /**
   * New Message.
   * @param {string} operation
   * @param {object} value
   */
  constructor(operation, value) {
    this._operation = operation;
    this._value = value;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': this._operation,
      'value': this._value
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
   * @param {string} chainID
   */
  constructor(message, account, fee, signature, chainID) {
    this._message = message;
    this._account = account;
    this._fee = fee;
    this._signature = signature;
    this._chainID = chainID;
  }

  /**
   * Serialize Transaction.
   */
  serialize() {
    const pk = Buffer.from(this._account.publicKey.buffer);
    return Util.sortJSON({
      'type': 'cosmos-sdk/StdTx',
      'value': {
        'chain_id': this._chainID,
        'msg': [this._message.serialize()],
        'fee': this._fee,
        'signatures': [
          {
            'pub_key': {
              'type': 'ethermint/PubKeySecp256k1',
              'value': pk.toString('base64')
            },
            'signature': this._signature.toString('base64')
          }
        ],
        'memo': ''
      }
    });
  }
}
